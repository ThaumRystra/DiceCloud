<template lang="html">
  <div class="note-viewer">
    <property-name :value="model.name" />
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
