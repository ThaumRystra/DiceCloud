<template>
	<div class="character-sheet">
    <v-toolbar app :color="character.color || 'primary'" :dark="isDarkColor(character.color || theme.primary)">
      <v-btn v-if="showMenuButton" flat icon @click="toggleDrawer">
        <v-icon>menu</v-icon>
      </v-btn>
			<v-btn v-if="showMenuButton" flat icon @click="recompute(character._id)">
        <v-icon>refresh</v-icon>
      </v-btn>
			<span>{{character.name}}</span>
    </v-toolbar>
    <v-content v-if="$subReady.singleCharacter">
			<stats-tab :char-id="character._id"/>
    </v-content>
		<v-content v-else>
			<v-progress-circular indeterminate />
		</v-content>
  </div>
</template>

<script>
	import Creatures from '/imports/api/creature/Creatures.js';
	import isDarkColor from '/imports/ui/utility/isDarkColor.js';
	import { mapMutations } from "vuex";
	import theme from '/imports/ui/theme.js';
	import StatsTab from '/imports/ui/character/StatsTab.vue';
	import { recomputeCreature } from '/imports/api/creature/creatureComputation.js'

	export default {
		props: {
			showMenuButton: Boolean,
			charId: String,
		},
		components: {
			StatsTab,
		},
		data(){return {
			theme,
		}},
		methods: {
      ...mapMutations([
        "toggleDrawer",
      ]),
			recompute(charId){
				recomputeCreature.call({charId});
			},
			isDarkColor,
    },
		meteor: {
			$subscribe: {
	      'singleCharacter': [this.charId],
			},
			character(){
				return Creatures.findOne(this.charId) || {};
			},
		},
	}
</script>

<style scoped>
</style>
