<template lang="html">
  <div class="damage-viewer">
    <v-row dense>
      <property-field
        :name="$t('AdjustmentForm.AndV_m2mK4EKCnXer50C8')"
        large
        center
        :calculation="model.amount"
      />
      <property-field
        :name="$t('TreeSearchInput.BAArIlU-xLOyjxKLYTPg7')"
        :value="type"
      />
      <property-field
        v-if="model.target === 'self'"
        :name="$t('DamageForm.zHu2ur9PIJmRoyqAo7Wmm')"
        value="Self"
      />
      <template v-if="model.save">
        <property-field
          name="DC"
          large
          center
          :calculation="model.save.dc"
        />
        <property-field
          :name="$t('ImageInputDialog.dcbgmuOVYglN2J7VpTBFU')"
          mono
          :value="model.save.stat"
        />
        <property-field
          :name="$t('DamageViewer.VEpM2ZSTeCTr2zrlY2MHq')"
          v-bind="saveDamage"
        />
      </template>
    </v-row>
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin';

export default {
  mixins: [propertyViewerMixin],
  computed: {
    type() {
      if (this.model.damageType === 'healing') return this.model.damageType;
      return `${this.model.damageType} damage`
    },
    saveDamage() {
      if (!this.model.save) return;
      if (!this.model.save.damageFunction?.calculation) {
        return { value: this.$t('DamageForm.1wEkuz0UjFyeKTJq_F1cS') };
      }
      if (this.model.save.damageFunction.calculation == '0' || this.model.save.damageFunction.value === 0) {
        return { value: this.$t('DamageViewer.eWiuTWrUZM43skOm_Erhe') };
      }
      return { calculation: this.model.save.damageFunction };
    }
  }
}
</script>

<style lang="css" scoped>

</style>
