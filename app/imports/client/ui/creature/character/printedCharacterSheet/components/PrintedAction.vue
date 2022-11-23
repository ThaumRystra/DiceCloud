<template lang="html">
  <div
    class="action-card"
    :class="cardClasses"
  >
    <div class="label text-center">
      {{ actionTypeName }}
    </div>
    <div class="d-flex align-center">
      <div class="avatar">
        <div
          v-if="rollBonus"
        >
          <template v-if="rollBonus && !rollBonusTooLong">
            {{ rollBonus }}
          </template>
          <property-icon
            v-else
            :model="model"
            color="rgba(0,0,0,0.7)"
          />
        </div>
        <property-icon
          v-else
          :model="model"
          color="rgba(0,0,0,0.7)"
        />
      </div>
      <div
        class="action-header flex d-flex column justify-center pl-1"
      >
        <div class="action-title my-1">
          {{ model.name || propertyName }}
        </div>
      </div>
    </div>
    <div
      v-if="Number.isFinite(model.uses)"
      class="action-sub-title d-flex align-center"
    >
      {{ model.uses }} uses
    </div>
    <div class="pb-3">
      <div
        v-if="model.resources && model.resources.attributesConsumed.length ||
          model.resources.itemsConsumed.length"
        class="resources my-2"
      >
        <div
          v-for="attributeConsumed in model.resources.attributesConsumed"
          :key="attributeConsumed._id"
          class="layout align-center justify-start"
        >
          Cost: {{ attributeConsumed.quantity && attributeConsumed.quantity.value }} {{ attributeConsumed.statName || attributeConsumed.variableName }}
        </div>
        <div
          v-for="itemConsumed in model.resources.itemsConsumed"
          :key="itemConsumed._id"
        >
          <template v-if="itemConsumed.itemName">
            Uses: {{ itemConsumed.quantity && itemConsumed.quantity.value || 0 }} {{ itemConsumed.itemName || itemConsumed.tag }}
          </template>
        </div>
      </div>
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
  </div>
</template>

<script lang="js">
import { getPropertyName } from '/imports/constants/PROPERTIES.js';
import numberToSignedString from '../../../../../../api/utility/numberToSignedString.js';
import AttributeConsumedView from '/imports/client/ui/properties/components/actions/AttributeConsumedView.vue';
import ItemConsumedView from '/imports/client/ui/properties/components/actions/ItemConsumedView.vue';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';
import MarkdownText from '/imports/client/ui/components/MarkdownText.vue';
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
    actionTypeName() {
      return {
        'action': 'Action',
        'bonus': 'Bonus Action',
        'attack': 'Attack',
        'reaction': 'Reaction',
        'free': 'Free Action',
        'long': 'Long Action'
      }[this.model.actionType] || this.model.actionType
    }
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
}
</script>

<style lang="css" scoped>
.action-card {
  transition: box-shadow .4s cubic-bezier(0.25, 0.8, 0.25, 1),
    transform 0.075s ease;
}

.avatar {
  font-size: 18pt;
  text-align: center;
  min-width: 40px;
  min-height: 40px;
}

.label {
  font-size: 10pt;
  font-variant: small-caps;
  flex-grow: 1;
}

.action-title {
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  position: relative;
  text-align: left;
  transition: .3s cubic-bezier(.25, .8, .5, 1);
  width: 100%;
}

.resources {
  font-size: 10pt;
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
