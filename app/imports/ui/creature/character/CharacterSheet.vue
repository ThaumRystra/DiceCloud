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
          Tree
        </v-tab>
      </v-tabs>
    </v-toolbar>
    <v-content v-if="$subReady.singleCharacter">
			<v-tabs-items v-model="tab">
				<v-tab-item>
					<tree-tab :character-id="creatureId"/>
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
	import TreeTab from '/imports/ui/creature/character/TreeTab.vue';
	import { recomputeCreature } from '/imports/api/creature/creatureComputation.js'

	export default {
		props: {
			showMenuButton: Boolean,
			creatureId: String,
		},
		components: {
			TreeTab,
		},
		data(){return {
			theme,
			tab: 0,
		}},
		methods: {
      ...mapMutations([
        "toggleDrawer",
      ]),
			recompute(creatureId){
				recomputeCreature.call({creatureId});
			},
			isDarkColor,
    },
		meteor: {
			$subscribe: {
	      'singleCharacter'(){
					return [this.creatureId];
				},
			},
			character(){
				return Creatures.findOne(this.creatureId) || {};
			},
		},
	}
</script>

<style scoped>
</style>
