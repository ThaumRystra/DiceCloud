<template lang="html">
  <v-list-item
    class="ability-list-tile"
    v-on="hasClickListener ? {click} : {}"
  >
    <v-list-item-action class="mr-4">
      <div class="text-h4 mod">
        <template v-if="swapScoresAndMods">
          <span :class="{'primary--text': model.currentValue !== model.value}">
            {{ model.currentValue }}
          </span>
        </template>
        <template v-else>
          {{ numberToSignedString(model.modifier) }}
        </template>
      </div>
      <div class="text-h6 value">
        <template v-if="swapScoresAndMods">
          {{ numberToSignedString(model.modifier) }}
        </template>
        <template v-else>
          <span :class="{'primary--text': model.currentValue !== model.value}">
            {{ model.currentValue }}
          </span>
        </template>
      </div>
    </v-list-item-action>

    <v-list-item-content>
      <v-list-item-title>
        {{ model.name }}
      </v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script lang="js">
import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
export default {
	props: {
		model: {type: Object, required: true},
	},
	computed: {
		hasClickListener(){
      return this.$listeners && this.$listeners.click
		},
	},
	methods: {
		numberToSignedString,
		click(e){
			this.$emit('click', e);
		},
	},
  meteor: {
    swapScoresAndMods(){
      let user = Meteor.user();
      return user &&
        user.preferences &&
        user.preferences.swapAbilityScoresAndModifiers;
    }
  }
}
</script>

<style lang="css" scoped>
	.ability-list-tile {
		background: inherit;
	}
	.ability-list-tile >>> .v-list__tile {
		height: 88px;
	}
	.ability-list-tile >>> .v-list__tile__action--stack {
		justify-content: center;
	}
	.value {
		font-weight: 600;
		font-size: 24px !important;
		color: rgba(0, 0, 0, 0.54);
	}
	.theme--dark .value {
		color: rgba(255, 255, 255, 0.54);
	}
	.mod, .value {
		text-align: center;
		width: 100%;
	}
</style>
