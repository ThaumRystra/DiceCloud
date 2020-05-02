<template lang="html">
  <div class="feature-viewer">
    <property-name :value="model.name" />
    <property-description :value="model.summary" />
    <v-divider class="mt-3 mb-3" />
    <property-description :value="model.description" />
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
