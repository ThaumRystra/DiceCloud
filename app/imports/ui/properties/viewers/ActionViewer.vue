<template lang="html">
  <div class="action-viewer">
    <div class="action-sub-title layout align-center justify-space-between wrap mb-3">
      <property-tags
        :tags="model.tags"
        no-margin
        class="mx-2"
      />
      <div
        v-if="!attack"
        class="mx-2"
      >
        {{ model.actionType }}
      </div>
    </div>
    <div class="layout align-center justify-space-around">
      <v-btn
        v-if="context.creatureId"
        outlined
        style="font-size: 18px;"
        class="ma-2"
        :color="model.color || 'primary'"
        :icon="!rollBonusTooLong"
        :loading="doActionLoading"
        :disabled="model.insufficientResources || !context.editPermission"
        @click.stop="doAction"
      >
        <template v-if="attack">
          {{ rollBonus }}
        </template>
        <property-icon
          v-else
          :model="model"
        />
      </v-btn>
      <div
        v-else-if="attack"
        style="font-size: 18px;"
        class="ma-2"
      >
        <code>{{ model.rollBonus }}</code>
        <span
          class="mx-1"
          style="font-size: 14px"
        >to hit</span>
      </div>
      <div v-if="model.uses">
        <span
          v-if="context.creatureId"
          class="uses mx-2"
        >
          {{ usesLeft }}/{{ model.usesResult }} uses
        </span>
        <span v-else>
          <code>{{ model.uses }}</code>
          <span class="mx-1">
            uses
          </span>
        </span>
        <span
          v-if="reset"
          class="mx-2"
        >
          {{ reset }}
        </span>
        <v-btn
          v-if="context.creatureId"
          outlined
          color="primary"
          :disabled="!model.usesUsed || !context.editPermission"
          @click="resetUses"
        >
          Reset
        </v-btn>
      </div>
    </div>
    <v-subheader
      v-if="model.resources.attributesConsumed.length ||
        model.resources.itemsConsumed.length"
      style="height: 32px"
    >
      Resources
    </v-subheader>
    <attribute-consumed-view
      v-for="attributeConsumed in model.resources.attributesConsumed"
      :key="attributeConsumed._id"
      class="action-child"
      :model="attributeConsumed"
      style="padding-left: 44px;"
    />
    <item-consumed-view
      v-for="itemConsumed in model.resources.itemsConsumed"
      :key="itemConsumed._id"
      class="action-child"
      :model="itemConsumed"
      :action="model"
      left-pad
    />
    <v-divider
      v-if="model.summary || model.description"
      class="my-3"
    />
    <template v-if="model.summary">
      <property-description
        :string="model.summary"
        :calculations="model.summaryCalculations"
        :inactive="model.inactive"
      />
      <v-divider
        v-if="model.description"
        class="my-3"
      />
    </template>
    <property-description
      :string="model.description"
      :calculations="model.descriptionCalculations"
      :inactive="model.inactive"
    />
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js';
import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
import doAction from '/imports/api/creature/actions/doAction.js';
import AttributeConsumedView from '/imports/ui/properties/components/actions/AttributeConsumedView.vue';
import ItemConsumedView from '/imports/ui/properties/components/actions/ItemConsumedView.vue';
import PropertyIcon from '/imports/ui/properties/shared/PropertyIcon.vue';
import updateCreatureProperty from '/imports/api/creature/creatureProperties/methods/updateCreatureProperty.js';

export default {
  components: {
    AttributeConsumedView,
    ItemConsumedView,
    PropertyIcon,
  },
  mixins: [propertyViewerMixin],
  props: {
    attack: Boolean,
  },
  inject: {
    context: {
      default: {},
    },
  },
  data(){return {
    doActionLoading: false,
  }},
  computed: {
    reset(){
      let reset = this.model.reset
      if (reset === 'shortRest'){
        return 'Reset on a short rest';
      } else if (reset === 'longRest'){
        return 'Reset on a long rest';
      }
      return undefined;
    },
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
      return Math.max(this.model.usesResult - (this.model.usesUsed || 0), 0);
    },
    actionTypeIcon() {
      return `$vuetify.icons.${this.model.actionType}`;
    },
  },
  methods: {
    doAction(){
      this.doActionLoading = true;
      doAction.call({actionId: this.model._id}, error => {
        this.doActionLoading = false;
        if (error){
          console.error(error);
        }
      });
    },
    resetUses(){
      updateCreatureProperty.call({
        _id: this.model._id,
        path: ['usesUsed'],
        value: 0,
      });
    },
  },
}
</script>

<style lang="css" scoped>
.action-sub-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.action-child {
  height: 40px;
}
</style>
