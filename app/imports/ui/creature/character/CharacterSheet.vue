<template>
  <div class="character-sheet layout column">
    <v-toolbar
      app
      clipped-left
      :color="creature.color || 'secondary'"
      :dark="isDarkColor(creature.color || theme.primary)"
    >
      <v-btn
        v-if="showMenuButton"
        flat
        icon
        @click="toggleDrawer"
      >
        <v-icon>menu</v-icon>
      </v-btn>
      <div class="flex">
        {{ creature.name }}
      </div>
      <v-btn
        flat
        icon
        @click="recompute(creature._id)"
      >
        <v-icon>refresh</v-icon>
      </v-btn>
      <v-menu
        bottom
        left
        transition="slide-y-transition"
        data-id="creature-menu"
      >
        <template #activator="{ on }">
          <v-btn
            icon
            v-on="on"
          >
            <v-icon>more_vert</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-tile @click="deleteCharacter">
            <v-list-tile-title>
              <v-icon>delete</v-icon> Delete
            </v-list-tile-title>
          </v-list-tile>
          <v-list-tile @click="showCharacterForm">
            <v-list-tile-title>
              <v-icon>create</v-icon> Edit details
            </v-list-tile-title>
          </v-list-tile>
          <v-list-tile @click="showShareDialog">
            <v-list-tile-title>
              <v-icon>share</v-icon> Sharing
            </v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
      <v-tabs
        slot="extension"
        v-model="tab"
        centered
        grow
      >
        <v-tab>
          Stats
        </v-tab>
        <v-tab>
          Features
        </v-tab>
        <v-tab>
          Inventory
        </v-tab>
        <v-tab>
          Spells
        </v-tab>
        <v-tab>
          Persona
        </v-tab>
        <v-tab>
          Tree
        </v-tab>
      </v-tabs>
    </v-toolbar>
    <v-content
      v-if="$subReady.singleCharacter"
      class="flex"
    >
      <v-tabs-items v-model="tab">
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
    </v-content>
    <v-content v-else>
      <v-progress-circular indeterminate />
    </v-content>
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
			showMenuButton: Boolean,
			creatureId: {
        type: String,
        required: true,
      },
		},
    reactiveProvide: {
      name: 'computationContext',
      include: ['creature'],
    },
		data(){return {
			theme,
			tab: 0,
		}},
		methods: {
      ...mapMutations([
        'toggleDrawer',
      ]),
			recompute(charId){
				recomputeCreature.call({charId});
			},
			showCharacterForm(){
				this.$store.commit('pushDialogStack', {
					component: 'creature-form-dialog',
					elementId: 'creature-menu',
					data: {
						_id: this.creatureId,
					},
				});
			},
			showShareDialog(){
				this.$store.commit('pushDialogStack', {
					component: 'share-dialog',
					elementId: 'creature-menu',
					data: {
						docRef: {
							id: this.creatureId,
							collection: 'creatures',
						}
					},
				});
			},
			deleteCharacter(){
				let that = this;
				this.$store.commit('pushDialogStack', {
					component: 'delete-confirmation-dialog',
					elementId: 'creature-menu',
					data: {
						name: this.creature.name,
						typeName: 'Character'
					},
					callback(confirmation){
						if(!confirmation) return;
						removeCreature.call({charId: that.creatureId}, (error) => {
							if (error) {
								console.error(error);
							} else {
								that.$router.push('/characterList');
							}
						});
					}
				});
			},
			isDarkColor,
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
	.v-tabs__bar {
		background: none !important;
	}
	.v-tabs__container--grow .v-tabs__div {
		max-width: 180px !important;
	}
	.v-window-item, .v-window, .v-window__container {
		height: 100%;
	}
	.v-window-item {
		padding: 0.1px;
	}
</style>
