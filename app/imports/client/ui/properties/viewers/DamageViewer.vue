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
    </v-row>
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin.js';

export default {
  mixins: [propertyViewerMixin],
  computed: {
    type() {
      if (this.model.damageType === 'healing') return this.model.damageType;
      return `${this.model.damageType} damage`
    },
  }
}
</script>

<style lang="css" scoped>

</style>
