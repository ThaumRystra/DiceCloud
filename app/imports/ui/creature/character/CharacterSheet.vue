<template>
	<div class="character-sheet layout column">
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
					Features
				</v-tab>
				<v-tab>
          Tree
        </v-tab>
      </v-tabs>
    </v-toolbar>
    <v-content class="flex" v-if="$subReady.singleCharacter">
			<v-tabs-items v-model="tab">
				<v-tab-item>
					<stats-tab/>
				</v-tab-item>
				<v-tab-item>
					<features-tab/>
				</v-tab-item>
				<v-tab-item>
					<tree-tab :creature-id="creatureId"/>
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
	import TreeTab from '/imports/ui/creature/character/characterSheetTabs/TreeTab.vue';
	import StatsTab from '/imports/ui/creature/character/characterSheetTabs/StatsTab.vue';
	import FeaturesTab from '/imports/ui/creature/character/characterSheetTabs/FeaturesTab.vue';
	import { recomputeCreature } from '/imports/api/creature/creatureComputation.js'

	export default {
		props: {
			showMenuButton: Boolean,
			creatureId: String,
		},
		components: {
			TreeTab,
			StatsTab,
			FeaturesTab,
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
					return [this.creatureId];
				},
			},
			character(){
				return Creatures.findOne(this.creatureId) || {};
			},
		},
	}
</script>

<style>
	.v-tabs__bar {
		background: none !important;
	}
	.v-window-item, .v-window, .v-window__container {
		height: 100%;
	}
	.v-window-item {
		padding: 0.1px;
	}
</style>
