<template lang="html">
  <v-card :hover="hasClickListener" @click="$emit('click')">
  	<v-toolbar
			flat
			style="transform: none;"
			:color="color"
			:dark="isDark"
		>
  		<slot name="toolbar"/>
  	</v-toolbar>
		<div
		>
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
			},
			hasClickListener(){
	    	return this.$listeners && !!this.$listeners.click
			},
		}
	};
</script>

<style lang="css" scoped>
</style>
