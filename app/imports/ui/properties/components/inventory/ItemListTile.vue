<template lang="html">
	<v-list-tile class="skill-list-tile" height="32px" v-on="hasClickListener ? {click} : {}">
		<v-list-tile-content>
			<v-list-tile-title>
				{{model.name}}
			</v-list-tile-title>
		</v-list-tile-content>
  </v-list-tile>
</template>

<script>
export default {
	props: {
		model: Object,
	},
}
</script>

<style lang="css" scoped>
</style>
