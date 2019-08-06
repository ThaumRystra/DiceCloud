<template lang="html">
  <div v-if="value !== undefined">
  	<div class="caption">
  		{{name}}
  	</div>
		<p class="ml-2 subheading">
			{{value}}
		</p>
  </div>
</template>

<script>
export default {
	props: {
		name: String,
		value: [String, Number],
	}
}
</script>

<style lang="css" scoped>
</style>
