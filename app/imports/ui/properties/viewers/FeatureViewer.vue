<template lang="html">
	<div class="feature-viewer">
		<h1 class="display-1">
			{{model.name}}
		</h1>
		<div v-if="model.alwaysEnabled" class="caption">
			Always enabled
		</div>
		<p v-if="model.description">
			{{model.description}}
		</p>
	</div>
</template>

<script>
export default {
	props: {
		model: {
			type: Object,
			required: true,
		},
	},
}
</script>

<style lang="css" scoped>
</style>
