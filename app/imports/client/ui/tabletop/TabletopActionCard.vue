<template lang="html">
  <v-sheet
    class="action-card  overflow-y-auto"
    rounded
    :class="cardClasses"
  >
    <div class="layout align-center px-3">
      <div
        class="avatar"
      >
        <v-btn
          icon
          outlined
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
            class="flex error--text"
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
      <template v-if=" model.summary">
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

<script lang="js">
import { getPropertyName } from '/imports/constants/PROPERTIES.js';
import numberToSignedString from '/imports/api/utility/numberToSignedString.js';
import doAction from '/imports/client/ui/creature/actions/doAction';
import AttributeConsumedView from '/imports/client/ui/properties/components/actions/AttributeConsumedView.vue';
import ItemConsumedView from '/imports/client/ui/properties/components/actions/ItemConsumedView.vue';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';
import MarkdownText from '/imports/client/ui/components/MarkdownText.vue';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue.js';
import TreeNodeList from '/imports/client/ui/components/tree/TreeNodeList.vue';
import { docsToForest } from '/imports/api/parenting/parentingFunctions';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { some } from 'lodash';
import { getFilter } from '/imports/api/parenting/parentingFunctions';

export default {
  components: {
    AttributeConsumedView,
    ItemConsumedView,
    MarkdownText,
    PropertyIcon,
    TreeNodeList,
  },
  inject: {
    context: {
      default: {},
    },
    theme: {
      default: {
        isDark: false,
      },
    },
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
    targets: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      activated: undefined,
      doActionLoading: false,
      hovering: false,
    }
  },
  computed: {
    rollBonus() {
      if (!this.model.attackRoll) return;
      return numberToSignedString(this.model.attackRoll.value);
    },
    rollBonusTooLong() {
      return this.rollBonus && this.rollBonus.length > 3;
    },
    propertyName() {
      return getPropertyName(this.model.type);
    },
    cardClasses() {
      return {
        'theme--dark': this.theme.isDark,
        'theme--light': !this.theme.isDark,
        'muted-text': this.model.insufficientResources,
        'active': this.activated,
        'tabletop-active': this.active,
        'elevation-8': this.hovering,
      }
    },
    actionTypeIcon() {
      return `$vuetify.icons.${this.model.actionType}`;
    },
    targetingError() {
      if (!this.active) return;
      const targets = this.targets || [];
      if (this.model.target === 'singleTarget' && targets.length === 0) {
        return 'Select target';
      } else if (targets.length > 1 && this.model.target !== 'multipleTargets'){
        return 'Single target only';
      } else if (this.model.target === 'self' && targets.length > 0){
        return 'Can only target self';
      }
      return undefined;
    }
  },
  meteor: {
    children() {
      const excludedRanges = [];
      const decendants = CreatureProperties.find({
        ...getFilter.descendants(this.model),
        'removed': { $ne: true },
      }, {
        sort: {left: 1}
      }).map(prop => {
        // Get all the props we don't want to show the decendants of and
        // where they might appear in the ancestor list
        if (prop.type === 'buff' || prop.type === 'folder') {
          excludedRanges.push({
            left: prop.left,
            right: prop.right,
          });
        }
        return prop;
      }).filter(prop => {
        // Filter out folders entirely
        if (prop.type === 'folder') return false;
        // Filter out decendants of terminating props
        return !some(excludedRanges, range => {
          return prop.left > range.left && prop.right < range.right;
        });
      });
      return docsToForest(decendants);
    },
  },
  methods: {
    click(e) {
      this.$emit('click', e);
    },
    doAction() {
      this.doActionLoading = true;
      this.$emit('close-menu')
      doAction({
        propId: this.model._id,
        creatureId: this.model.root.id,
        targetIds: this.targets,
        $store: this.$store,
        elementId: 'do-action-button',
        callback: action => action?._id || this.model._id,
      }).catch((e) => {
        console.error(e);
        snackbar({ text: e.message || e.reason || e.toString() });
      }).finally(() => {
        this.doActionLoading = false;
      });
    },
    shwing() {
      this.activated = true;
      setTimeout(() => {
        this.activated = undefined;
      }, 150);
    },
  }
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

.theme--light.muted-text {
  color: rgba(0, 0, 0, .3) !important;
}

.theme--dark.muted-text {
  color: hsla(0, 0%, 100%, .3) !important;
}

.action-card {
  transition: transform 0.15s cubic;
}
</style>

<style lang="css">
.action-card.theme--light.muted-text .v-icon {
  color: rgba(0, 0, 0, .3) !important;
}

.action-card.theme--dark.muted-text .v-icon {
  color: hsla(0, 0%, 100%, .3) !important;
}

.action-card .property-description>p:last-of-type {
  margin-bottom: 0;
}

.action-card .v-btn--icon {
  transition: all .3s ease, height .3s ease;
}
</style>
