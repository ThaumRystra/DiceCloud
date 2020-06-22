<template lang="html">
  <v-list-tile
    class="ability-list-tile"
    v-on="hasClickListener ? {click} : {}"
  >
    <v-list-tile-action class="mr-4">
      <div class="display-1 mod">
        <template v-if="swapScoresAndMods">
          {{ model.value }}
        </template>
        <template v-else>
          {{ numberToSignedString(model.modifier) }}
        </template>
      </div>
      <div class="title value">
        <template v-if="swapScoresAndMods">
          {{ numberToSignedString(model.modifier) }}
        </template>
        <template v-else>
          {{ model.value }}
        </template>
      </div>
    </v-list-tile-action>

    <v-list-tile-content>
      <v-list-tile-title>
        {{ model.name }}
      </v-list-tile-title>
    </v-list-tile-content>
  </v-list-tile>
</template>

<script>
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
