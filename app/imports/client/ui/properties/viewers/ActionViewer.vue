<template lang="html">
  <div class="action-viewer">
    <v-row dense>
      <property-field
        v-if="context.creatureId"
        :name="model.type === 'spell'? 'Cast spell' : 'Apply action'"
        center
      >
        <v-btn
          outlined
          style="font-size: 18px;"
          class="ma-2"
          data-id="do-action-button"
          :color="model.color || 'primary'"
          icon
          :loading="doActionLoading"
          :disabled="model.insufficientResources || !context.editPermission"
          @click.stop="doAction"
        >
          <property-icon
            right
            :model="model"
          />
        </v-btn>
      </property-field>
      <property-field
        name="To hit"
        large
        center
        signed
        :calculation="model.attackRoll"
      />
      <property-field
        name="Action type"
        :value="actionTypes[model.actionType]"
      />
      <property-field
        name="Targeting"
        :value="targetTypes[model.target]"
      />
      <property-field
        v-if="model.uses"
        name="Uses"
      >
        <template v-if="context.creatureId && model.uses.value">
          <v-spacer />
          {{ usesLeft }}/{{ model.uses.value }}
          <v-spacer />
          <v-btn
            v-if="context.creatureId"
            text
            color="primary"
            :disabled="!model.usesUsed || !context.editPermission"
            @click="resetUses"
          >
            Reset
          </v-btn>
        </template>
        <span v-else>
          <code>{{ model.uses.calculation }}</code>
        </span>
      </property-field>
      <property-field
        name="Reset"
        :value="reset"
      />
      <property-field
        v-if="model.resources.attributesConsumed.length"
        name="Attributes consumed"
      >
        <div style="width: 100%;">
          <attribute-consumed-view
            v-for="attributeConsumed in model.resources.attributesConsumed"
            :key="attributeConsumed._id"
            class="action-child"
            :model="attributeConsumed"
          />
        </div>
      </property-field>
      <property-field
        v-if="model.resources.itemsConsumed.length"
        name="Items consumed"
      >
        <div style="width: 100%;">
          <item-consumed-view
            v-for="itemConsumed in model.resources.itemsConsumed"
            :key="itemConsumed._id"
            class="action-child"
            :model="itemConsumed"
            :action="model"
          />
        </div>
      </property-field>
      <slot />
      <property-description
        name="Summary"
        :model="model.summary"
      />
      <property-description
        name="Description"
        :model="model.description"
      />
    </v-row>
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin.js';
import doAction from '/imports/api/engine/actions/doAction.js';
import AttributeConsumedView from '/imports/client/ui/properties/components/actions/AttributeConsumedView.vue';
import ItemConsumedView from '/imports/client/ui/properties/components/actions/ItemConsumedView.vue';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';
import updateCreatureProperty from '/imports/api/creature/creatureProperties/methods/updateCreatureProperty.js';
import doCastSpell from '/imports/api/engine/actions/doCastSpell.js';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue.js';

export default {
  components: {
    AttributeConsumedView,
    ItemConsumedView,
    PropertyIcon,
  },
  mixins: [propertyViewerMixin],
  inject: {
    context: {
      default: {},
    },
  },
  props: {
    attack: Boolean,
  },
  data() {
    return {
      doActionLoading: false,
      actionTypes: {
        action: 'Action',
        bonus: 'Bonus action',
        attack: 'Attack action',
        reaction: 'Reaction',
        free: 'Free action',
        long: 'Long action',
      },
      targetTypes: {
        self: 'Self',
        singleTarget: 'Single target',
        multipleTargets: 'Multiple targets',
      },
    }
  },
  computed: {
    reset() {
      let reset = this.model.reset
      if (reset === 'shortRest') {
        return 'Reset on a short rest';
      } else if (reset === 'longRest') {
        return 'Reset on a long rest';
      }
      return undefined;
    },
    rollBonusTooLong() {
      return this.rollBonus && this.rollBonus.length > 3;
    },
    totalUses() {
      if (!this.model.uses) return 0;
      return Math.max(this.model.uses.value || 0, 0);
    },
    usesLeft() {
      return Math.max(this.totalUses - (this.model.usesUsed || 0), 0);
    },
    actionTypeIcon() {
      return `$vuetify.icons.${this.model.actionType}`;
    },
  },
  methods: {
    doAction() {
      if (this.model.type === 'action') {
        this.doActionLoading = true;
        doAction.call({ actionId: this.model._id }, error => {
          this.doActionLoading = false;
          if (error) {
            snackbar({ text: error.reason });
            console.error(error);
          }
        });
      } else if (this.model.type === 'spell') {
        this.$store.commit('pushDialogStack', {
          component: 'cast-spell-with-slot-dialog',
          elementId: 'do-action-button',
          data: {
            creatureId: this.context.creatureId,
            spellId: this.model._id,
          },
          callback({ spellId, slotId, advantage, ritual } = {}) {
            if (!spellId) return;
            doCastSpell.call({
              spellId,
              slotId,
              ritual,
              scope: {
                '~attackAdvantage': { value: advantage },
              },
            }, error => {
              if (!error) return;
              snackbar({ text: error.reason });
              console.error(error);
            });
          },
        });
      }
    },
    resetUses() {
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
