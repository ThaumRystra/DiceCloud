<template lang="html">
  <div class="container-viewer">
  	<h1 class="display-1">
			{{model.name}}
		</h1>
		<div v-if="!model.carried" class="caption">
			Not carried
		</div>
		<div v-if="model.contentsWeightless" class="caption">
			Contents are weightless
		</div>
		<div>
			Weight: {{model.weight}} lbs
		</div>
		<div>
			Value: {{model.value}} gp
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
