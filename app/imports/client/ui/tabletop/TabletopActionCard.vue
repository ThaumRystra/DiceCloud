<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import { getPropertyName } from '/imports/constants/PROPERTIES.js';
import numberToSignedString from '/imports/api/utility/numberToSignedString.js';
import doAction from '/imports/client/ui/creature/actions/doAction';
import AttributeConsumedView from '/imports/client/ui/properties/components/actions/AttributeConsumedView.vue';
import ItemConsumedView from '/imports/client/ui/properties/components/actions/ItemConsumedView.vue';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';
import MarkdownText from '/imports/client/ui/components/MarkdownText.vue';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import TreeNodeList from '/imports/client/ui/components/tree/TreeNodeList.vue';
import { docsToForest, getFilter } from '/imports/api/parenting/parentingFunctions';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { some } from 'lodash';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{
  model: any;
  targets: any[];
  active?: boolean;
}>();

const emit = defineEmits(['click', 'close-menu']);

const store = useStore(key);
const context = inject<any>('context', {});
const theme = inject<{ isDark: boolean }>('theme', { isDark: false });

const activated = ref<boolean | undefined>(undefined);
const doActionLoading = ref(false);
const hovering = ref(false);

const rollBonus = computed(() => {
  if (!props.model.attackRoll) return;
  return numberToSignedString(props.model.attackRoll.value);
});

const rollBonusTooLong = computed(() => rollBonus.value && rollBonus.value.length > 3);
const propertyName = computed(() => getPropertyName(props.model.type));

const cardClasses = computed(() => ({
  'v-theme--dark': theme.isDark,
  'v-theme--light': !theme.isDark,
  'muted-text': props.model.insufficientResources,
  'active': activated.value,
  'tabletop-active': props.active,
  'elevation-8': hovering.value,
}));

const actionTypeIcon = computed(() => `$vuetify.icons.${props.model.actionType}`);

const targetingError = computed(() => {
  if (!props.active) return;
  const targets = props.targets || [];
  if (props.model.target === 'singleTarget' && targets.length === 0) return 'Select target';
  if (targets.length > 1 && props.model.target !== 'multipleTargets') return 'Single target only';
  if (props.model.target === 'self' && targets.length > 0) return 'Can only target self';
  return undefined;
});

const { result: children } = autorun(() => {
  const excludedRanges: any[] = [];
  const descendants = CreatureProperties.find({
    ...getFilter.descendants(props.model),
    removed: { $ne: true },
  }, { sort: { left: 1 } }).map((prop: any) => {
    if (prop.type === 'buff' || prop.type === 'folder') {
      excludedRanges.push({ left: prop.left, right: prop.right });
    }
    return prop;
  }).filter((prop: any) => {
    if (prop.type === 'folder') return false;
    return !some(excludedRanges, range => prop.left > range.left && prop.right < range.right);
  });
  return docsToForest(descendants);
});

function click(e: Event) {
  emit('click', e);
}

async function doActionFn() {
  doActionLoading.value = true;
  emit('close-menu');
  try {
    await doAction({
      propId: props.model._id,
      creatureId: props.model.root.id,
      targetIds: props.targets,
      $store: store,
      elementId: 'do-action-button',
      callback: (action: any) => action?._id || props.model._id,
    });
  } catch (e: any) {
    console.error(e);
    snackbar({ text: e.message || e.reason || e.toString() });
  } finally {
    doActionLoading.value = false;
  }
}

function shwing() {
  activated.value = true;
  setTimeout(() => { activated.value = undefined; }, 150);
}
</script>

<template lang="html">
  <v-sheet
    class="action-card  overflow-y-auto"
    rounded
    :class="cardClasses"
  >
    <div class="d-flex align-center px-3">
      <div class="avatar">
        <v-btn
          icon
          variant="outlined"
          style="letter-spacing: normal;"
          class="mr-2"
          :style="{
            fontSize: '24px'
          }"
          data-id="do-action-button"
          :color="model.color || 'primary'"
          :loading="doActionLoading"
          :disabled="model.insufficientResources || !context.editPermission"
          @click="doAction"
        >
          <template v-if="rollBonus && !rollBonusTooLong">
            {{ rollBonus }}
          </template>
          <property-icon
            v-else
            :model="model"
          />
        </v-btn>
      </div>
      <div
        class="action-header flex layout column justify-center pl-1"
        style="height: 72px; cursor: pointer;"
        @click="$emit('open-details')"
      >
        <div class="action-title my-1">
          {{ model.name || propertyName }}
        </div>
        <div class="action-sub-title layout align-center">
          <div
            v-if="targetingError"
            class="flex text-error"
          >
            {{ targetingError }}
          </div>
          <template v-else>
            <div class="flex">
              {{ model.actionType }}
            </div>
            <div v-if="Number.isFinite(model.usesLeft)">
              {{ model.usesLeft }} uses
            </div>
          </template>
        </div>
      </div>
    </div>
    <div class="px-3 pb-3">
      <template
        v-if="model.resources && model.resources.attributesConsumed.length ||
          model.resources.itemsConsumed.length"
      >
        <attribute-consumed-view
          v-for="attributeConsumed in model.resources.attributesConsumed"
          :key="attributeConsumed._id"
          class="action-child"
          :model="attributeConsumed"
        />
        <item-consumed-view
          v-for="itemConsumed in model.resources.itemsConsumed"
          :key="itemConsumed._id"
          class="action-child"
          :model="itemConsumed"
          :action="model"
        />
        <v-divider
          v-if="model.summary"
          class="my-2"
        />
      </template>
      <template v-if="model.summary">
        <markdown-text :markdown="model.summary.value || model.summary.text" />
      </template>
      <v-divider v-if="children && children.length" />
      <tree-node-list
        v-if="children && children.length"
        start-expanded
        :children="children"
        :root="model.root"
        @selected="e => $emit('sub-click', e)"
      />
    </div>
  </v-sheet>
</template>

<style lang="css" scoped>
.action-card {
  transition: box-shadow .4s cubic-bezier(0.25, 0.8, 0.25, 1),
    transform 0.075s ease,
    width .3s ease,
    margin-top .3s ease,
    height .3s ease;
  max-width: 100vw;
  position: relative;
  max-height: calc(100vh - 144px);
}

.action-card.tabletop-active {
  margin-top: -100px;
  width: 320px;
  height: 300px;
}

.action-card.active {
  transform: scale(0.92);
}

.action-card-container {
  transition: width .3s ease;
}

.action-title {
  font-size: 16px;
  font-weight: 400;
  height: 24px;
  line-height: 24px;
  position: relative;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: .3s cubic-bezier(.25, .8, .5, 1);
  width: 100%;
}

.action-sub-title {
  color: #9e9e9e;
  flex-grow: 0;
  font-size: 12px;
  line-height: 12px;
  height: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.action-child {
  height: 32px;
}

.v-theme--light.muted-text {
  color: rgba(0, 0, 0, .3) !important;
}

.v-theme--dark.muted-text {
  color: hsla(0, 0%, 100%, .3) !important;
}

.action-card {
  transition: transform 0.15s cubic;
}
</style>

<style lang="css">
.action-card.v-theme--light.muted-text .v-icon {
  color: rgba(0, 0, 0, .3) !important;
}

.action-card.v-theme--dark.muted-text .v-icon {
  color: hsla(0, 0%, 100%, .3) !important;
}

.action-card .property-description > p:last-of-type {
  margin-bottom: 0;
}

.action-card .v-btn--icon {
  transition: all .3s ease, height .3s ease;
}
</style>
