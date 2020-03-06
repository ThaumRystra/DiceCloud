<template lang="html">
	<component
		v-if="model && $options.components[model.type]"
		class="property-viewer"
		:is="model.type"
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
		},
	},
}
</script>

<style lang="css">
</style>
