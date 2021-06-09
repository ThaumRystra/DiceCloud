<template lang="html">
  <div class="reference-viewer">
    <property-field
      v-if="model.cache.error"
      name="Error"
      :value="model.cache.error"
    />
    <property-field
      v-else-if="model.ref && model.ref.id"
      name="Linked Property"
      :value="model.cache.node && model.cache.node.name || model.ref.id"
    />
    <property-field
      v-if="model.cache.library && model.cache.library.name"
      name="Library"
      :value="model.cache.library.name"
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
