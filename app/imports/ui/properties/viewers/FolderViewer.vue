<template lang="html">
	<div class="folder-viewer">
		<h1 class="display-1">
			{{model.name}}
		</h1>
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
