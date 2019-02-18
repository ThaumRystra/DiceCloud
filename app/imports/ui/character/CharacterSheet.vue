<template>
	<div class="character-sheet">
    <v-toolbar app :color="character.color || 'secondary'" :dark="isDarkColor(character.color || theme.primary)">
      <v-btn v-if="showMenuButton" flat icon @click="toggleDrawer">
        <v-icon>menu</v-icon>
      </v-btn>
			<v-btn v-if="showMenuButton" flat icon @click="recompute(character._id)">
        <v-icon>refresh</v-icon>
      </v-btn>
			<span>{{character.name}}</span>
			<v-tabs
        slot="extension"
        v-model="tab"
        centered
      >
        <v-tab>
          Stats
        </v-tab>
				<v-tab>
          Tree
        </v-tab>
      </v-tabs>
    </v-toolbar>
    <v-content v-if="$subReady.singleCharacter">
			<v-tabs-items v-model="tab">
	      <v-tab-item>
	        <stats-tab :char-id="character._id"/>
	      </v-tab-item>
				<v-tab-item>
					<character-tree-view :char-id="character._id"/>
				</v-tab-item>
    	</v-tabs-items>
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
	import { theme } from '/imports/ui/theme.js';
	import StatsTab from '/imports/ui/character/StatsTab.vue';
	import CharacterTreeView from '/imports/ui/character/CharacterTreeView.vue';
	import { recomputeCreature } from '/imports/api/creature/creatureComputation.js'

	export default {
		props: {
			showMenuButton: Boolean,
			charId: String,
		},
		components: {
			StatsTab,
			CharacterTreeView,
		},
		watch: {
			charId(newValue){
				console.log(newValue)
			},
		},
		data(){return {
			theme,
			tab: 0,
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
	      'singleCharacter'(){
					return [this.charId];
				},
			},
			character(){
				return Creatures.findOne(this.charId) || {};
			},
		},
	}
</script>

<style scoped>
</style>
