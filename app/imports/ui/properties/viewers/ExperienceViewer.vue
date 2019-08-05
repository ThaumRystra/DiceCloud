<template lang="html">
	<div class="experience-viewer">
		<h1 class="display-1" v-if="model.value">
			{{model.value}} XP
		</h1>
		<div class="headline layout row mb-3">
			<div>
				{{model.name}}
			</div>
			<v-spacer/>
			<div>
				{{model.worldDate}}
			</div>
		</div>
		<p>
			{{model.date}}
		</p>
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
