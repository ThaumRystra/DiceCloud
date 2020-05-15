<template>
  <div class="character-sheet fill-height">
    <v-fade-transition mode="out-in">
      <div
        v-if="$subReady.singleCharacter"
        key="character-tabs"
        class="fill-height"
      >
        <v-tabs-items
          v-model="tabs"
        >
          <v-tab-item>
            <stats-tab :creature-id="creatureId" />
          </v-tab-item>
          <v-tab-item>
            <features-tab :creature-id="creatureId" />
          </v-tab-item>
          <v-tab-item>
            <inventory-tab :creature-id="creatureId" />
          </v-tab-item>
          <v-tab-item>
            <spells-tab :creature-id="creatureId" />
          </v-tab-item>
          <v-tab-item>
            <persona-tab :creature-id="creatureId" />
          </v-tab-item>
          <v-tab-item>
            <tree-tab :creature-id="creatureId" />
          </v-tab-item>
        </v-tabs-items>
      </div>
      <div
        v-else
        key="character-loading"
        class="fill-height layout justify-center align-center"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        />
      </div>
    </v-fade-transition>
  </div>
</template>

<script>
  //TODO add a "no character found" screen if shown on a false address
  // or on a character the user does not have permission to view
	import Creatures from '/imports/api/creature/Creatures.js';
	import removeCreature from '/imports/api/creature/removeCreature.js';
	import isDarkColor from '/imports/ui/utility/isDarkColor.js';
	import { mapMutations } from 'vuex';
	import { theme } from '/imports/ui/theme.js';
	import StatsTab from '/imports/ui/creature/character/characterSheetTabs/StatsTab.vue';
	import FeaturesTab from '/imports/ui/creature/character/characterSheetTabs/FeaturesTab.vue';
	import InventoryTab from '/imports/ui/creature/character/characterSheetTabs/InventoryTab.vue';
	import SpellsTab from '/imports/ui/creature/character/characterSheetTabs/SpellsTab.vue';
	import PersonaTab from '/imports/ui/creature/character/characterSheetTabs/PersonaTab.vue';
	import TreeTab from '/imports/ui/creature/character/characterSheetTabs/TreeTab.vue';
	import { recomputeCreature } from '/imports/api/creature/computation/recomputeCreature.js';

	export default {
		components: {
			StatsTab,
			FeaturesTab,
			InventoryTab,
			SpellsTab,
			PersonaTab,
			TreeTab,
		},
		props: {
			creatureId: {
        type: String,
        required: true,
      },
      tabs: {
        type: Number,
        required: true,
      },
		},
    reactiveProvide: {
      name: 'computationContext',
      include: ['creature'],
    },
    onMounted(){
      this.$store.commit('setPageTitle', this.creature && this.creature.name || 'Character Sheet');
    },
    watch: {
      'creature.name'(value){
        this.$store.commit('setPageTitle', value || 'Character Sheet');
      },
    },
		meteor: {
			$subscribe: {
        'singleCharacter'(){
					return [this.creatureId];
				},
			},
			creature(){
				return Creatures.findOne(this.creatureId) || {};
			},
		},
	}
</script>

<style>
  .character-sheet .v-window-item {
    min-height: calc(100vh - 96px);
    overflow: hidden;
  }
</style>
