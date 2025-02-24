<template lang="html">
  <div class="effect-viewer">
    <v-row dense>
      <property-field :name="$t('AdjustmentForm.a3GneFZJ3MOMwzxGWJgMq')">
        <div
          class="layout"
          style="overflow: hidden;"
        >
          <v-icon class="mr-2">
            {{ effectIcon }}
          </v-icon>
          {{ operation }}
        </div>
      </property-field>
      <property-field
        v-if="model.operation !== 'conditional'"
        :name="$t('AdjustmentForm.AndV_m2mK4EKCnXer50C8')"
        :value="displayedValue || ' '"
      />
      <property-target-tags
        v-if="model.targetByTags"
        :model="model"
      />
      <property-field
        v-else
        :name="$t('CharacterSheetDialog.NnBUF4ZwE2sxY2H9laU5t')"
      >
        <div class="d-flex flex-wrap">
          <v-chip
            v-for="(stat, index) in model.stats"
            :key="index"
            class="ma-1"
          >
            {{ stat }}
          </v-chip>
        </div>
      </property-field>
      <property-field
        v-if="model.operation === 'conditional'"
        :name="$t('TreeSearchInput.n00nuv-ruVz9Ug_Vv51wY')"
        :cols="{cols: 12}"
        :value="model.text || ' '"
      />
    </v-row>
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin';
import PropertyTargetTags from '/imports/client/ui/properties/viewers/shared/PropertyTargetTags.vue';
import getEffectIcon from '/imports/client/ui/utility/getEffectIcon';
import { isFinite } from 'lodash';

export default {
  components: {
    PropertyTargetTags,
  },
  mixins: [propertyViewerMixin],
  computed: {
    resolvedValue() {
      if (!this.model.amount) return;
      return this.model.amount.value !== undefined ?
        this.model.amount.value :
        this.model.amount.calculation;
    },
    effectIcon() {
      let value = this.resolvedValue;
      return getEffectIcon(this.model.operation, value);
    },
    operation() {
      switch (this.model.operation) {
        case 'base': return this.$t('AttributeEffect.NbNtxtSkIF-eEvpQ6M1VH');
        case 'add': return this.$t('AttributeEffect.9iZBUqNtV818puHQ9S5mA');
        case 'mul': return this.$t('AttributeEffect.Y45EOUc4qxDGlx5Xzle92');
        case 'min': return this.$t('AttributeEffect.PWglsxP8zZNtoVCZtbg-l');
        case 'max': return this.$t('AttributeEffect.dEk96gl0uh7EJIwSh--a6');
        case 'set': return this.$t('EffectForm.WEtHJEmy9l5UiGuanUysJ');
        case 'advantage': return this.$t('AdvantageInput.GOVw9p7PQMyvg1W3QMv1h');
        case 'disadvantage': return this.$t('AdvantageInput.sN61sdTDUmZNRJhgdk3FT');
        case 'passiveAdd': return this.$t('AttributeEffect.TdH_tc2p6Vkb18y3GO7hY');
        case 'fail': return this.$t('AttributeEffect.UzlEh2YQm-EU6POm5FZsj');
        case 'conditional': return this.$t('AttributeEffect.sZxywbspgVnqysC8fZKES');
        default: return this.model.operation;
      }
    },
    displayedValue() {
      let value = this.resolvedValue;
      switch (this.model.operation) {
        case 'base': return value;
        case 'add': return isFinite(value) ? Math.abs(value) : value;
        case 'mul': return value;
        case 'min': return value;
        case 'max': return value;
        case 'advantage': return;
        case 'disadvantage': return;
        case 'passiveAdd': return isFinite(value) ? Math.abs(value) : value;
        case 'fail': return;
        case 'conditional': return;
        default: return undefined;
      }
    }
  },
};
</script>

<style lang="css" scoped>
.icon {
  min-width: 30px;
}

.icon {
  color: inherit !important;
}

.net-effect {
  flex-grow: 0;
  flex-shrink: 0;
}

.value,
.calculation {
  min-width: 80px;
}
</style>
