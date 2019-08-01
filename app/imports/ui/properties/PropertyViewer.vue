<template lang="html">
	<component
		v-if="model"
		class="property-viewer"
		:is="model.type"
		:model="model"
	/>
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

<style lang="css" scoped>
</style>
