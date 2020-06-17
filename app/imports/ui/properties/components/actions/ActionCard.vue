<template lang="html">
  <v-card
    class="action-card"
    :class="cardClasses"
    :elevation="hovering ? 8 : undefined"
  >
    <div class="layout row align-center px-3">
      <div class="avatar">
        <v-btn
          flat
          icon
          outline
          style="margin-left: -4px; font-size: 18px;"
          :color="model.color || 'primary'"
          :loading="doActionLoading"
          :disabled="model.insufficientResources || !context.editPermission"
          @click.stop="doAction"
        >
          <template v-if="attack && !rollBonusTooLong">
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
        <div
          class="action-title my-1"
        >
          {{ model.name || propertyName }}
        </div>
        <div class="action-sub-title layout row align-center">
          <div class="flex">
            {{ model.actionType }}
          </div>
          <div v-if="model.uses">
            {{ usesLeft }} uses
          </div>
        </div>
      </div>
    </div>
    <div class="px-3 pb-3">
      <template
        v-if="model.resources.attributesConsumed.length ||
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
          v-if="model.summary || children.length"
          class="my-2"
        />
      </template>
      <template v-if="model.summary">
        <property-description :value="model.summary" />
        <v-divider
          v-if="children.length"
          class="my-2"
        />
      </template>
      <tree-node-view
        v-for="child in children"
        :key="child._id"
        class="action-child"
        :model="child"
      />
    </div>
  </v-card>
</template>

<script>
import { getPropertyName } from '/imports/constants/PROPERTIES.js';
import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
import doAction from '/imports/api/creature/actions/doAction.js';
import getActiveProperties from '/imports/api/creature/getActiveProperties.js';
import TreeNodeView from '/imports/ui/properties/treeNodeViews/TreeNodeView.vue';
import AttributeConsumedView from '/imports/ui/properties/components/actions/AttributeConsumedView.vue';
import ItemConsumedView from '/imports/ui/properties/components/actions/ItemConsumedView.vue';
import PropertyDescription from '/imports/ui/properties/viewers/shared/PropertyDescription.vue';
import PropertyIcon from '/imports/ui/properties/shared/PropertyIcon.vue';

export default {
  components: {
    TreeNodeView,
    AttributeConsumedView,
    ItemConsumedView,
    PropertyDescription,
    PropertyIcon,
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
    attack: {
      type: Boolean,
    },
  },
  data(){return {
    activated: undefined,
    doActionLoading: false,
    hovering: false,
  }},
  computed: {
    rollBonus(){
      if (!this.attack) return;
      return numberToSignedString(this.model.rollBonusResult);
    },
    rollBonusTooLong(){
      return this.rollBonus && this.rollBonus.length > 3;
    },
    totalUses(){
      return Math.max(this.model.usesResult, 0);
    },
    usesLeft(){
      return Math.max(this.model.usesResult - this.model.usesUsed, 0);
    },
    propertyName(){
      return getPropertyName(this.model.type);
    },
    cardClasses() {
      return {
        'theme--dark': this.theme.isDark,
        'theme--light': !this.theme.isDark,
        'muted-text': this.model.insufficientResources,
        'shrink': this.activated,
      }
    },
    actionTypeIcon() {
      return `$vuetify.icons.${this.model.actionType}`;
    },
	},
  meteor: {
    children(){
      return getActiveProperties({
        ancestorId: this.model._id,
        filter: {'parent.id': this.model._id},
        options: {sort: {order: 1}},
      });
    },
  },
  methods: {
    click(e){
			this.$emit('click', e);
		},
    doAction(){
      this.doActionLoading = true;
      this.shwing();
      doAction.call({actionId: this.model._id}, error => {
        this.doActionLoading = false;
        if (error){
          console.error(error);
        }
      });
    },
    shwing(){
      this.activated = true;
      setTimeout(() => {
        this.activated = undefined;
      }, 300);
    }
  }
}
</script>

<style lang="css" scoped>
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
  transition: .3s cubic-bezier(.25,.8,.5,1);
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
  color: rgba(0,0,0,.3) !important;
}
.theme--dark.muted-text {
  color: hsla(0,0%,100%,.3) !important;
}
.action-card {
  transition: transform 0.15s cubic;
}
</style>

<style lang="css">
.action-card.theme--light.muted-text .v-icon {
  color: rgba(0,0,0,.3) !important;
}
.action-card.theme--dark.muted-text .v-icon {
  color: hsla(0,0%,100%,.3) !important;
}
.action-card .property-description > p:last-of-type {
  margin-bottom: 0;
}
</style>
