<template lang="html">
  <div class="action-viewer">
    <v-row dense>
      <property-field
        v-if="context.creatureId"
        :name="$t('ActionViewer.ZdLamTjTwN50xEr4pobC7')"
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
        :name="$t('ActionViewer.LuJ5GbVYRabP8sH91Amw0')"
        large
        center
        signed
        :calculation="model.attackRoll"
      />
      <property-field
        :name="$t('ActionForm.Swu-7z8ZpCzf1wlyF0m3F')"
        :value="actionTypes[model.actionType]"
      />
      <property-field
        :name="$t('ActionViewer.2PAXZyo6dsMayT5h8Vxl9')"
        :value="targetTypes[model.target]"
      />
      <property-field
        v-if="model.uses"
        :name="$t('ActionForm.kIN6lH7jJTD3RaF7WkyUy')"
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
            {{ $t('ResetSelector.i6eGWDKtSDJDxSkvSA9bB') }}
          </v-btn>
        </template>
        <span v-else>
          <code>{{ model.uses.calculation }}</code>
        </span>
      </property-field>
      <property-field
        :name="$t('ResetSelector.i6eGWDKtSDJDxSkvSA9bB')"
        :value="reset"
      />
      <property-field
        v-if="model.resources.conditions && model.resources.conditions.length"
        :name="$t('ResourcesForm.lQGikx2mch-_nphcT4bTY')"
      >
        <div style="width: 100%;">
          <action-condition-view
            v-for="condition in model.resources.conditions"
            :key="condition._id"
            class="action-child"
            :model="condition"
          />
        </div>
      </property-field>
      <property-field
        v-if="model.resources.attributesConsumed.length"
        :name="$t('ActionViewer.Vs9l_E_xRjNrphvjnTfxg')"
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
        :name="$t('ActionViewer.eUx-vcgpMRH8dtONDZPHm')"
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
        :name="$t('ActionForm.uMqJz6So1tbWiONiw7coZ')"
        :model="model.summary"
      />
      <property-description
        :name="$t('TabletopForm.nOLcz4YcyQNTwJKSAWI0K')"
        :model="model.description"
      />
    </v-row>
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin';
import ActionConditionView from '/imports/client/ui/properties/components/actions/ActionConditionView.vue';
import AttributeConsumedView from '/imports/client/ui/properties/components/actions/AttributeConsumedView.vue';
import ItemConsumedView from '/imports/client/ui/properties/components/actions/ItemConsumedView.vue';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';
import updateCreatureProperty from '/imports/api/creature/creatureProperties/methods/updateCreatureProperty';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import doAction from '/imports/client/ui/creature/actions/doAction';

export default {
  components: {
    ActionConditionView,
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
        action: this.$t('PrintedAction.IrhNSkzJSRi84GhcibaA6'),
        bonus: this.$t('ActionForm.t_rdlLehNy3iLM13m8KHi'),
        attack: this.$t('ActionForm.kPjD8rr_PnXqy-pMLGLXp'),
        reaction: this.$t('PrintedAction.mfg8w8IEyp7lqOtrKA716'),
        free: this.$t('ActionForm.L7CIoiuGHz6rNUNfQR0x1'),
        long: this.$t('ActionForm.pW9GN3ykvnJUE5ozpy0zR'),
      },
      targetTypes: {
        self: this.$t('ActionForm.wvr48hnF1DbxApmRDC3R0'),
        singleTarget: this.$t('ActionCard.5IbE7yubecegAHFjeu4mr'),
        multipleTargets: this.$t('ActionForm.SPian0NX_8UamXDgapfmE'),
      },
    }
  },
  computed: {
    reset() {
      let reset = this.model.reset
      if (reset === 'shortRest') {
        return this.$t('ActionViewer.mPkSelm59kG9PgRpl7PuX');
      } else if (reset === 'longRest') {
        return this.$t('ActionViewer.bN9dpIryBBN8_iI1JacWp');
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
      if (this.model.type === 'spell') {
        return this.$store.commit('pushDialogStack', {
          component: 'cast-spell-with-slot-dialog',
          elementId: 'cast-spell',
          data: {
            creatureId: this.model.root.id,
            spellId: this.model._id,
          },
        });
      }
      this.doActionLoading = true;
      doAction({
        creatureId: this.model.root.id,
        $store: this.$store,
        propId: this.model._id,
        elementId: 'do-action-button',
      }).catch((e) => {
        console.error(e);
        snackbar({ text: e.message || e.reason || e.toString() });
      }).finally(() => {
        this.doActionLoading = false;
      });
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
