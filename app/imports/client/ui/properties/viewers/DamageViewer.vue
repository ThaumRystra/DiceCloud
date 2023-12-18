<template lang="html">
  <div class="damage-viewer">
    <v-row dense>
      <property-field
        name="Amount"
        large
        center
        :calculation="model.amount"
      />
      <property-field
        name="Type"
        :value="type"
      />
      <property-field
        v-if="model.target === 'self'"
        name="Target"
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
          name="Save"
          mono
          :value="model.save.stat"
        />
        <property-field
          name="On a successful saving throw"
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
        return { value: 'Half damage' };
      }
      if (this.model.save.damageFunction.calculation == '0' || this.model.save.damageFunction.value === 0) {
        return { value: 'No damage' };
      }
      return { calculation: this.model.save.damageFunction };
    }
  }
}
</script>

<style lang="css" scoped>

</style>
