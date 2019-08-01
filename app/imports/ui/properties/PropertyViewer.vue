<template lang="html">
	<component
		v-if="model"
		class="property-viewer"
		:is="model.type"
		:model="model"
	/>
</template>

<script>
export default {
	props: {
		model: {
			type: Object,
		},
	},
}
</script>

<style lang="css" scoped>
</style>
