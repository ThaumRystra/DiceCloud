<template lang="html">
	<v-list-tile class="ability-list-tile"  v-on="hasClickListener ? {click} : {}">

		<v-list-tile-action class="mr-4">
			<div class="display-1 modifier">
				{{numberToSignedString(modifier)}}
			</div>
			<div class="title score">
				{{score}}
			</div>
		</v-list-tile-action>

	  <v-list-tile-content>
			<v-list-tile-title>
				{{name}}
			</v-list-tile-title>
	  </v-list-tile-content>

	</v-list-tile>
</template>

<script>
import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
export default {
	props: {
		score: Number,
		modifier: Number,
		name: String,
	},
	methods: {
		numberToSignedString,
		click(e){
			this.$emit('click', e);
		},
	},
	computed: {
		hasClickListener(){
    	return this.$listeners && this.$listeners.click
		},
	}
}
</script>

<style lang="css" scoped>
	.ability-list-tile >>> .v-list__tile {
		height: 88px;
	}
	.ability-list-tile >>> .v-list__tile__action--stack {
		justify-content: center;
	}
	.score {
		font-weight: 600;
		font-size: 24px !important;
		color: rgba(0, 0, 0, 0.54);
	}
	.modifier, .score {
		text-align: center;
		width: 100%;
	}
</style>
