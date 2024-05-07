<template lang="html">
  <v-card
    class="action-card"
    :class="cardClasses"
    :data-id="model._id"
  >
    <div class="layout align-center px-3">
      <div class="avatar">
        <v-btn
          icon
          outlined
          style="font-size: 16px; letter-spacing: normal;"
          class="mr-2"
          :color="model.color || 'primary'"
          :loading="doActionLoading"
          :disabled="model.insufficientResources || !context.editPermission || !!targetingError"
          @click.stop="doAction"
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
        @mouseover="hovering = true"
        @mouseleave="hovering = false"
        @click="$emit('click')"
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
        v-if="showResources"
      >
        <action-condition-view
          v-for="condition in model.resources.conditions"
          :key="condition._id"
          class="action-child"
          :model="condition"
        />
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
        show-external-details
        :children="children"
        :root="model.root"
        @selected="e => $emit('sub-click', e)"
      />
    </div>
    <card-highlight :active="hovering" />
  </v-card>
</template>

<script lang="js">
import { getPropertyName } from '/imports/constants/PROPERTIES';
import numberToSignedString from '/imports/api/utility/numberToSignedString';
import doAction from '/imports/client/ui/creature/actions/doAction';
import ActionConditionView from '/imports/client/ui/properties/components/actions/ActionConditionView.vue';
import AttributeConsumedView from '/imports/client/ui/properties/components/actions/AttributeConsumedView.vue';
import ItemConsumedView from '/imports/client/ui/properties/components/actions/ItemConsumedView.vue';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';
import MarkdownText from '/imports/client/ui/components/MarkdownText.vue';
import CardHighlight from '/imports/client/ui/components/CardHighlight.vue';
import TreeNodeList from '/imports/client/ui/components/tree/TreeNodeList.vue';
import { docsToForest as nodeArrayToTree } from '/imports/api/parenting/parentingFunctions';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { some } from 'lodash';

export default {
  components: {
    ActionConditionView,
    AttributeConsumedView,
    ItemConsumedView,
    MarkdownText,
    PropertyIcon,
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
    targets: {
      type: Array,
      default: undefined,
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
    showResources() {
      if (this.model.resources?.attributesConsumed?.length
        || this.model.resources?.itemsConsumed?.length) return true;
      return some(this.model.resources?.conditions, con => con.condition && !con.condition.value);
    },
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
    targetingError(){
      // Can always do an action without a target
      if (!this.targets || !this.targets.length) return undefined;
      if (this.targets.length > 1 && this.model.target !== 'multipleTargets'){
        return 'Single target';
      } else if (this.model.target === 'self' && this.targets[0] !== this.model.ancestors[0]._id){
        return 'Can only target self';
      }
      return undefined;
    }
  },
  meteor: {
    children() {
      const indicesOfTerminatingProps = [];
      const decendants = CreatureProperties.find({
        'ancestors.id': this.model._id,
        'removed': { $ne: true },
      }, {
        sort: {left: 1}
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
    doAction() {
      this.doActionLoading = true;
      doAction(this.model, this.$store, this.model._id).catch((e) => {
        console.error(e);
      }).finally(() => {
        this.doActionLoading = false;
      });
    },
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
