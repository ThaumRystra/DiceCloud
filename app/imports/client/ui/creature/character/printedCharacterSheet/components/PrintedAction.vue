<template lang="html">
  <div
    class="action-card"
    :class="cardClasses"
  >
    <div class="d-flex align-center mb-2">
      <div class="action-title text-center flex-grow-1">
        {{ model.name || propertyName }}
      </div>
      <div class="avatar">
        <property-icon
          :model="model"
          color="rgba(0,0,0,0.7)"
        />
      </div>
    </div>
    <div
      v-if="Number.isFinite(model.uses)"
      class="action-sub-title d-flex align-center"
    >
      {{ model.uses }} uses
    </div>
    <div>
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
      <div
        v-if="rollBonus"
        class="roll-bonus"
      >
        <span class="to-hit ml-2">
          {{ rollBonus }}
        </span>
        <span>
          to hit
        </span>
      </div>
      <tree-node-list
        v-if="children && children.length"
        start-expanded
        :children="children"
        :root="{id: model._id, collection: 'creatureProperties'}"
        @selected="e => $emit('sub-click', e)"
      />
    </div>
    <div class="action-subtitle text-center">
      {{ actionTypeName }}
    </div>
  </div>
</template>

<script lang="js">
import { getPropertyName } from '/imports/constants/PROPERTIES';
import numberToSignedString from '/imports/api/utility/numberToSignedString';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';
import MarkdownText from '/imports/client/ui/components/MarkdownText.vue';
import TreeNodeList from '/imports/client/ui/components/tree/TreeNodeList.vue';
import { getFilter, docsToForest } from '/imports/api/parenting/parentingFunctions';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { some } from 'lodash';

export default {
  components: {
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
    },
  },
  meteor: {
    children() {
      const rangesToExclude = [];
      const descendants = CreatureProperties.find({
        ...getFilter.descendants(this.model),
        'removed': { $ne: true },
      }, {
        sort: {left: 1}
      }).map(prop => {
        // Get all the props we don't want to show the descendants of and
        // where they might appear in the ancestor list
        if (prop.type === 'buff' || prop.type === 'folder') {
          rangesToExclude.push({
            left: prop.left,
            right: prop.right,
          });
        }
        return prop;
      }).filter(prop => {
        // Filter out folders entirely
        if (prop.type === 'folder') return false;
        // Filter out descendants of terminating props
        return !some(rangesToExclude, range => {
          return prop.left > range.left && prop.right < range.right;
        });
      });
      return docsToForest(descendants);
    },
  },
}
</script>

<style lang="css" scoped>
.action-card {
  transition: box-shadow .4s cubic-bezier(0.25, 0.8, 0.25, 1),
    transform 0.075s ease;
}
.roll-bonus {
  color: rgba(0, 0, 0, 0.87);
}
.to-hit {
  color: rgba(0, 0, 0, 0.54);
  font-size: 18pt;
  flex-basis: 24px;
}
.avatar {
  min-width: 24px;
  min-height: 24px;
  line-height: 24px;
}

.label {
  font-size: 10pt;
  font-variant: all-small-caps;
  flex-grow: 1;
}

.damage {
  font-size: 12pt;
  font-weight: 500;
}
.action-title {
  font-size: 12pt;
  font-weight: 600;
  min-height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-variant: all-small-caps;
}

.action-subtitle {
  font-variant: all-small-caps;
  font-size: 11pt;
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
