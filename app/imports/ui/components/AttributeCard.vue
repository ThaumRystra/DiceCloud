<template lang="html">
  <v-card :hover="hasClickListener" @click="click">
  	<v-card-text>
  		<v-layout row align-center>
  			<div class="value display-1 mr-1">
  				{{modifier ? signed(value) : value}}
  			</div>
				<v-flex class="name text-truncate">
					{{name}}
				</v-flex>
  		</v-layout>
  	</v-card-text>
  </v-card>
</template>

<script>
	import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
	export default {
		props: {
			name: String,
			value: Number,
			modifier: Boolean,
		},
		methods: {
			signed: numberToSignedString,
			click(e){
				this.$emit('click', e);
			},
		},
		computed: {
			hasClickListener(){
	    	return this.$listeners && !!this.$listeners.click
			},
		},
	}
</script>

<style lang="css" scoped>
	.value {
		min-width: 64px;
		text-align: center;
	}
</style>
