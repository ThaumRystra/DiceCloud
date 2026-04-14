<template lang="html">
  <v-sheet
    class="action-card  overflow-y-auto"
    rounded
    :class="cardClasses"
  >
    <div
      class="action-header d-flex align-stretch px-3"
      style="height: 72px;"
      @click="$emit('open-details')"
    >
      <div
        class="d-flex flex-grow-1 align-center"
        style="cursor: pointer;"
        @mouseover="hovering = true"
        @mouseleave="hovering = false"
      >
        <property-icon
          :model="model"
          :color="model.color"
        />
        <div class="mx-3">
          {{ model.name || propertyName }}
        </div>
      </div>
      <div class="d-flex align-center">
        <v-btn
          icon
          @click.stop="remove"
        >
          <v-icon>
            mdi-delete
          </v-icon>
        </v-btn>
      </div>
    </div>
    <div class="px-3 pb-3">
      <template v-if="model.description">
        <markdown-text :markdown="model.description.value || model.description.text" />
      </template>
    </div>
    <card-highlight :active="hovering" />
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import { getPropertyName } from '/imports/constants/PROPERTIES.js';
import numberToSignedString from '/imports/api/utility/numberToSignedString.js';
import doAction from '/imports/client/ui/creature/actions/doAction';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';
import MarkdownText from '/imports/client/ui/components/MarkdownText.vue';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import { docsToForest, getFilter } from '/imports/api/parenting/parentingFunctions';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { some } from 'lodash';
import softRemoveProperty from '/imports/api/creature/creatureProperties/methods/softRemoveProperty';
import getPropertyTitle from '/imports/client/ui/properties/shared/getPropertyTitle';
import restoreProperty from '/imports/api/creature/creatureProperties/methods/restoreProperty';
import CardHighlight from '/imports/client/ui/components/CardHighlight.vue';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{
  model: any;
  targets?: any[];
  active?: boolean;
  embedded?: boolean;
}>();

const emit = defineEmits(['click', 'close-menu', 'removed']);

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
    excludedRanges.push({ left: prop.left, right: prop.right });
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
      $store: store,
      elementId: 'do-action-button',
      targetIds: [],
    });
  } catch (e: any) {
    console.error(e);
    snackbar({ text: e.message || e.reason || e.toString() });
  } finally {
    doActionLoading.value = false;
  }
}

function remove() {
  const _id = props.model._id;
  softRemoveProperty.callAsync({ _id });
  if (props.embedded) {
    emit('removed');
  } else {
    store.dispatch('popDialogStack');
  }
  snackbar({
    text: `Deleted ${getPropertyTitle(props.model)}`,
    callbackName: 'undo',
    callback() {
      restoreProperty.callAsync({ _id });
    },
  });
}

function shwing() {
  activated.value = true;
  setTimeout(() => { activated.value = undefined; }, 150);
}
</script>

<style lang="css" scoped>
.action-card {
  transition: box-shadow .4s cubic-bezier(0.25, 0.8, 0.25, 1),
    transform 0.075s ease,
    width .3s ease,
    margin-top .3s ease,
    height .3s ease;
  max-width: 100vw;
  position: relative;
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
