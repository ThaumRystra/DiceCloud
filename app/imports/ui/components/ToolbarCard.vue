<template lang="html">
  <v-card :hover="hasClickListener" @click="$emit('click')">
  	<v-toolbar
			flat
			:style="`transform: none; ${hasToolbarClickListener ? 'cursor: pointer;' : ''}`"
			:color="color"
			:dark="isDark"
			@click="$emit('toolbarclick')"
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
	    	return this.$listeners && !!this.$listeners.click;
			},
			hasToolbarClickListener(){
	    	return this.$listeners && !!this.$listeners.toolbarclick;
			},
		}
	};
</script>

<style lang="css" scoped>
</style>
