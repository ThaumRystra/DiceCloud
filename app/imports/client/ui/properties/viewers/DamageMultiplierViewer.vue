<template lang="html">
  <div>
    <v-row dense>
      <property-field
        :name="$t('ConstantForm.aEv2NC1UXKBC9Z63kT9Jb')"
        :value="operation"
      />
      <property-field
        :name="$t('DamageMultiplierViewer.oWlXMZwuJvWlVZ-udcQJp')"
        wrap
      >
        <v-chip
          v-for="(damageType, index) in model.damageTypes"
          :key="index"
          class="mt-1 mr-1"
          :input-value="true"
          outlined
          small
          label
        >
          {{ damageType }}
        </v-chip>
      </property-field>
      <property-field
        v-if="model.includeTags && model.includeTags.length"
        :name="$t('DamageMultiplierViewer.9cqY7yDMx3pdjzizi_zX3')"
        wrap
      >
        <v-chip
          v-for="(damageType, index) in model.includeTags"
          :key="index"
          class="mt-1 mr-1"
          :input-value="true"
          small
          outlined
        >
          {{ damageType }}
        </v-chip>
      </property-field>
      <property-field
        v-if="model.excludeTags && model.excludeTags.length"
        :name="$t('DamageMultiplierViewer.NYuY8i7lURiZ8pIEADEW9')"
        wrap
      >
        <v-chip
          v-for="(damageType, index) in model.excludeTags"
          :key="index"
          class="mt-1 mr-1"
          :input-value="true"
          small
          outlined
        >
          {{ damageType }}
        </v-chip>
      </property-field>
    </v-row>
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin'
export default {
  mixins: [propertyViewerMixin],
  computed: {
    operation() {
      switch (this.model.value) {
        case 0: return this.$t('PrintedDamageMultipliers.uNx-Dyhk3Z17Q7dWuR4Bp');
        case 0.5: return this.$t('PrintedDamageMultipliers.uP77KRfYo25L_qwnj-JQR');
        case 2: return this.$t('PrintedDamageMultipliers.p5oBcNFeC2ebcPTxmWvab');
        default: return '';
      }
    },
  },
}
</script>

<style lang="css" scoped>

</style>
