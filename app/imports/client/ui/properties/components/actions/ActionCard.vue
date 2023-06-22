<template lang="html">
  <v-card
    class="action-card"
    :class="cardClasses"
  >
    <div class="layout align-center px-3">
      <div class="avatar">
        <roll-popup
          v-if="rollBonus"
          icon
          outlined
          style="font-size: 16px; letter-spacing: normal;"
          class="mr-2"
          :color="model.color || 'primary'"
          :loading="doActionLoading"
          :disabled="model.insufficientResources || !context.editPermission"
          :roll-text="rollBonus"
          :name="model.name"
          :advantage="model.attackRoll && model.attackRoll.advantage"
          @roll="doAction"
        >
          <template v-if="rollBonus && !rollBonusTooLong">
            {{ rollBonus }}
          </template>
          <property-icon
            v-else
            :model="model"
          />
        </roll-popup>
        <v-btn
          v-else
          icon
          outlined
          style="font-size: 16px; letter-spacing: normal;"
          class="mr-2"
          :color="model.color || 'primary'"
          :loading="doActionLoading"
          :disabled="model.insufficientResources || !context.editPermission"
          @click.stop="doAction"
        >
          <property-icon :model="model" />
        </v-btn>
      </div>
      <div
        class="action-header flex layout column justify-center pl-1"
        style="height: 72px; cursor: pointer;"
        @mouseover="hovering = true"
        @mouseleave="hovering = false"
        @click="$emit('click')"
      >
        <div class="action-title my-1">
          {{ model.name || propertyName }}
        </div>
        <div class="action-sub-title layout align-center">
          <div class="flex">
            {{ model.actionType }}
          </div>
          <div v-if="Number.isFinite(model.usesLeft)">
            {{ model.usesLeft }} uses
          </div>
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
        @selected="e => $emit('sub-click', e)"
      />
    </div>
    <card-highlight :active="hovering" />
  </v-card>
</template>

<script lang="js">
import { getPropertyName } from '/imports/constants/PROPERTIES.js';
import numberToSignedString from '../../../../../api/utility/numberToSignedString.js';
import doAction from '/imports/api/engine/actions/doAction.js';
import AttributeConsumedView from '/imports/client/ui/properties/components/actions/AttributeConsumedView.vue';
import ItemConsumedView from '/imports/client/ui/properties/components/actions/ItemConsumedView.vue';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';
import RollPopup from '/imports/client/ui/components/RollPopup.vue';
import MarkdownText from '/imports/client/ui/components/MarkdownText.vue';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue.js';
import CardHighlight from '/imports/client/ui/components/CardHighlight.vue';
import TreeNodeList from '/imports/client/ui/components/tree/TreeNodeList.vue';
import { nodeArrayToTree } from '/imports/api/parenting/nodesToTree.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { some } from 'lodash';

export default {
  components: {
    AttributeConsumedView,
    ItemConsumedView,
    MarkdownText,
    PropertyIcon,
    RollPopup,
    CardHighlight,
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
        'elevation-8': this.hovering,
      }
    },
    actionTypeIcon() {
      return `$vuetify.icons.${this.model.actionType}`;
    },
  },
  meteor: {
    children() {
      const indicesOfTerminatingProps = [];
      const decendants = CreatureProperties.find({
        'ancestors.id': this.model._id,
        'removed': { $ne: true },
      }, {
        sort: {order: 1}
      }).map(prop => {
        // Get all the props we don't want to show the decendants of and
        // where they might appear in the ancestor list
        if (prop.type === 'buff' || prop.type === 'folder') {
          indicesOfTerminatingProps.push({
            id: prop._id,
            ancestorIndex: prop.ancestors.length,
          });
        }
        return prop;
      }).filter(prop => {
        // Filter out folders entirely
        if (prop.type === 'folder') return false;
        // Filter out decendants of terminating props
        return !some(indicesOfTerminatingProps, buffIndex => {
          return prop.ancestors[buffIndex.ancestorIndex]?.id === buffIndex.id;
        });
      });
      return nodeArrayToTree(decendants);
    },
  },
  methods: {
    click(e) {
      this.$emit('click', e);
    },
    doAction({ advantage }) {
      this.doActionLoading = true;
      this.shwing();
      doAction.call({
        actionId: this.model._id,
        scope: {
          '~attackAdvantage': { value: advantage },
        }
      }, error => {
        this.doActionLoading = false;
        if (error) {
          console.error(error);
          snackbar({ text: error.reason || error.message || error.toString() });
        }
      });
    },
    shwing() {
      this.activated = true;
      setTimeout(() => {
        this.activated = undefined;
      }, 150);
    }
  }
}
</script>

<style lang="css" scoped>
.action-card {
  transition: box-shadow .4s cubic-bezier(0.25, 0.8, 0.25, 1),
    transform 0.075s ease;
}

.action-card.active {
  transform: scale(0.92);
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
</style>
