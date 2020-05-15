<template lang="html">
  <v-list-tile
    class="skill-list-tile"
    height="32px"
    v-on="hasClickListener ? {click} : {}"
  >
    <v-list-tile-action class="prof-icon">
      <v-icon>{{ icon }}</v-icon>
    </v-list-tile-action>
    <v-list-tile-content>
      <v-list-tile-title>
        <span
          v-if="!hideModifier"
          class="prof-mod"
        >
          {{ displayedModifier }}
        </span>
        <v-icon
          v-if="model.advantage > 0"
          size="20px"
        >
          arrow_upward
        </v-icon>
        <v-icon
          v-if="model.advantage < 0"
          size="20px"
        >
          arrow_downward
        </v-icon>
        {{ model.name }}
        <template v-if="model.conditionalBenefits && model.conditionalBenefits.length">
          *
        </template>
        <template v-if="model.passiveBonus">
          ({{ passiveScore }})
        </template>
      </v-list-tile-title>
    </v-list-tile-content>
  </v-list-tile>
</template>

<script>
import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';

export default {
	props: {
    model: {
      type: Object,
      required: true,
    },
    hideModifier: Boolean,
	},
	computed: {
		icon(){
			if (this.model.proficiency == 0.5){
				return 'brightness_2';
			} else if (this.model.proficiency == 1) {
				return 'brightness_1'
			} else if (this.model.proficiency == 2){
				return 'album'
			} else {
				return 'radio_button_unchecked';
			}
		},
		displayedModifier(){
			let mod = this.model.value;
			if (this.model.fail){
				return 'fail';
			} else {
				return numberToSignedString(mod);
			}
		},
		hasClickListener(){
      return this.$listeners && this.$listeners.click
		},
    passiveScore(){
      return 10 + this.model.value + this.model.passiveBonus;
    }
	},
	methods: {
		click(e){
			this.$emit('click', e);
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
