<template lang="html">
  <v-list-tile class="skill-list-tile" height="32px" v-on="hasClickListener ? {click} : {}">
  	<v-list-tile-action class="prof-icon">
  		<v-icon>
  			{{icon}}
  		</v-icon>
  	</v-list-tile-action>
		<v-list-tile-content>
			<v-list-tile-title>
				<span class="prof-mod">
					{{displayedModifier}}
				</span>
				{{name}}<template v-if="conditionalBenefits">*</template>
				<v-icon size="20px" v-if="advantage > 0">arrow_upward</v-icon>
				<v-icon size="20px" v-if="advantage < 0">arrow_downward</v-icon>
			</v-list-tile-title>
		</v-list-tile-content>
  </v-list-tile>
</template>

<script>
import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';

export default {
	props: {
		proficiency: Number,
		advantage: Number,
		fail: Number,
		value: Number,
		name: String,
		conditionalBenefits: Number,
	},
	methods: {
		click(e){
			this.$emit('click', e);
		},
	},
	computed: {
		icon(){
			if (this.proficiency == 0.5){
				return 'brightness_2';
			} else if (this.proficiency == 1) {
				return 'brightness_1'
			} else if (this.proficiency == 2){
				return 'album'
			} else {
				return 'radio_button_unchecked';
			}
		},
		displayedModifier(){
			let mod = this.value;
			if (this.fail){
				return 'fail';
			} else {
				return numberToSignedString(mod);
			}
		},
		hasClickListener(){
    	return this.$listeners && this.$listeners.click
		},
	}
}
</script>

<style lang="css" scoped>
	.skill-list-tile >>> .v-list__tile {
		height: 34px;
	}
	.skill-list-tile{
		background: inherit;
	}
	.prof-icon {
		min-width: 30px;
	}
	.prof-mod {
		display: inline-block;
		width: 45px;
		text-align: center;
	}
</style>
