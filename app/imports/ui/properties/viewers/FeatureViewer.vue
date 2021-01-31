<template lang="html">
  <div class="feature-viewer">
    <property-name :value="model.name" />
    <property-description
      :string="model.summary"
      :calculations="model.summaryCalculations"
    />
    <v-divider class="mt-3 mb-3" />
    <property-description
      :string="model.description"
      :calculations="model.descriptionCalculations"
    />
  </div>
</template>

<script>
import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js'
export default {
	mixins: [propertyViewerMixin],
}
</script>

<style lang="css" scoped>
</style>
