<template lang="html">
  <component
    :is="model.type"
    v-if="model && $options.components[model.type]"
    :key="model._id"
    class="property-viewer"
    :model="model"
  />
  <div v-else-if="model">
    This property can't be viewed yet.
  </div>
</template>

<script>
import propertyViewerIndex from '/imports/ui/properties/viewers/shared/propertyViewerIndex.js';
export default {
	components: {
		...propertyViewerIndex,
	},
	props: {
		model: {
			type: Object,
      default: undefined
		},
	},
}
</script>

<style lang="css">
</style>
