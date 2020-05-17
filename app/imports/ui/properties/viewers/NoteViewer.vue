<template lang="html">
  <div class="note-viewer">
    <property-name :value="model.name" />
    <property-description
      v-if="model.description"
      :value="model.description"
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
