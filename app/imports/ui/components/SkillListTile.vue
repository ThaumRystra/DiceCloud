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
				{{name}}
				<template v-if="conditionalBenefit">*</template>
				<v-icon size="20px" v-if="advantage && !disadvantage">arrow_upward</v-icon>
				<v-icon size="20px" v-if="!advantage && disadvantage">arrow_downward</v-icon>
			</v-list-tile-title>
		</v-list-tile-content>
  </v-list-tile>
</template>

<script>
export default {
	props: {
		proficiency: Number,
		advantage: Boolean,
		disadvantage: Boolean,
		fail: Boolean,
		modifier: Number,
		name: String,
		conditionalBenefit: String,
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
			let mod = this.modifier;
			if (this.fail){
				return 'fail';
			} else if (mod === 0){
				return '+0';
			} else if (mod > 0 && typeof mod === 'number'){
				return `+${mod}`
			} else {
				return mod;
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
	.prof-icon {
		min-width: 30px;
	}
	.prof-mod {
		display: inline-block;
		width: 45px;
		text-align: center;
	}
</style>
