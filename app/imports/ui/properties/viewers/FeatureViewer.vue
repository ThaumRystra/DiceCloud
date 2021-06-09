<template lang="html">
  <div class="feature-viewer">
    <property-name :value="model.name" />
    <property-description
      :string="model.summary"
      :calculations="model.summaryCalculations"
      :inactive="model.inactive"
    />
    <v-divider class="mt-3 mb-3" />
    <property-description
      :string="model.description"
      :calculations="model.descriptionCalculations"
      :inactive="model.inactive"
    />
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js'
export default {
	mixins: [propertyViewerMixin],
}
</script>

<style lang="css" scoped>
</style>
