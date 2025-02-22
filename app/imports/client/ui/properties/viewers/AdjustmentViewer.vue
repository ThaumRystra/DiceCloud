<template lang="html">
  <div class="adjustment-viewer">
    <v-row dense>
      <property-field
        :name="$t('AdjustmentForm.AndV_m2mK4EKCnXer50C8')"
        center
        large
      >
        <v-icon class="mx-1">
          {{ effectIcon }}
        </v-icon>
        {{ displayedValue }}
      </property-field>
      <property-field
        :name="$t('AdjustmentForm.GHSISPeV1o-lHDQGal1TZ')"
        mono
        :value="model.stat"
      />
      <property-field
        v-if="model.target === 'self'"
        :name="$t('DamageForm.zHu2ur9PIJmRoyqAo7Wmm')"
        value="Self"
      />
    </v-row>
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin';
import getEffectIcon from '/imports/client/ui/utility/getEffectIcon';

export default {
  mixins: [propertyViewerMixin],
  computed: {
    effectIcon() {
      let effectOp = this.model.operation === 'increment' ? 'add' : 'base';
      let value = this.value;
      if (typeof value === 'string') {
        value = 1;
      }
      return getEffectIcon(effectOp, -value);
    },
    value() {
      if (this.model.amount && 'value' in this.model.amount) {
        return this.model.amount.value;
      } else {
        return this.model.amount.calculation;
      }
    },
    displayedValue() {
      if (
        typeof this.value === 'number' &&
        this.model.operation !== 'set'
      ) {
        return Math.abs(this.value);
      } else {
        return this.value;
      }
    },
    tooltip() {
      if (this.model.operation === 'increment') {
        if (
          typeof this.value === 'string' ||
          this.value >= 0
        ) {
          return this.$t('AdjustmentViewer.pDVyy7MwJYGrzQq0jDPC6');
        } else {
          return this.$t('AttributeEffect.9iZBUqNtV818puHQ9S5mA')
        }
      } else {
        return this.$t('EffectForm.WEtHJEmy9l5UiGuanUysJ')
      }
    }
  },
}
</script>

<style lang="css" scoped>

</style>
