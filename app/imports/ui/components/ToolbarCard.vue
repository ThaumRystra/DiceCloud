<template lang="html">
  <v-card>
  	<v-toolbar
			flat
			style="transform: none;"
			@click="$emit('click')"
			:color="color"
			:dark="isDark"
		>
  		<slot name="toolbar"/>
  	</v-toolbar>
		<div>
			<slot/>
		</div>
  </v-card>
</template>

<script>
	import isDarkColor from '/imports/ui/utility/isDarkColor.js';
	export default {
		props: {
			color: {
				type: String,
				default(){
					return this.$vuetify.theme.secondary;
				},
			},
		},
		computed: {
			isDark(){
				return isDarkColor(this.color);
			}
		}
	};
</script>

<style lang="css" scoped>
</style>
