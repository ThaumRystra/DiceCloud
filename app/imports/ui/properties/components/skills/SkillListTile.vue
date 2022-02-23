<template lang="html">
  <v-list-item
    class="skill-list-tile"
    style="min-height: 36px;"
    v-on="hasClickListener ? {click} : {}"
  >
    <v-list-item-content class="py-0">
      <v-list-item-title class="d-flex align-center">
        <roll-popup
          v-if="!hideModifier"
          class="prof-mod mr-1"
          button-class="px-2"
          text
          :roll-text="displayedModifier"
          :name="model.name"
          :advantage="model.advantage"
        >
          <proficiency-icon
            :value="model.proficiency"
            class="prof-icon mr-2"
          />
          <div class="prof-mod">
            {{ displayedModifier }}
          </div>
          <v-icon
            v-if="model.advantage > 0"
            size="20px"
          >
            mdi-chevron-double-up
          </v-icon>
          <v-icon
            v-if="model.advantage < 0"
            size="20px"
          >
            mdi-chevron-double-down
          </v-icon>
        </roll-popup>
        <div>
          {{ model.name }}
          <template v-if="model.conditionalBenefits && model.conditionalBenefits.length">
            *
          </template>
          <template v-if="'passiveBonus' in model">
            ({{ passiveScore }})
          </template>
        </div>
      </v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script lang="js">
import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
import ProficiencyIcon from '/imports/ui/properties/shared/ProficiencyIcon.vue';
import RollPopup from '/imports/ui/components/RollPopup.vue';

export default {
  components: {
    ProficiencyIcon,
    RollPopup,
  },
	props: {
    model: {
      type: Object,
      required: true,
    },
    hideModifier: Boolean,
	},
	computed: {
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
	.prof-icon {
		min-width: 30px;
	}
	.prof-mod {
    min-width: 32px;
	}
</style>
