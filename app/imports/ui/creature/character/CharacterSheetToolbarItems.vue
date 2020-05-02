<template lang="html">
  <v-toolbar-items>
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
  </v-toolbar-items>
</template>

<script>
import Creatures from '/imports/api/creature/Creatures.js';
import removeCreature from '/imports/api/creature/removeCreature.js';
import isDarkColor from '/imports/ui/utility/isDarkColor.js';
import { mapMutations } from 'vuex';
import { theme } from '/imports/ui/theme.js';
import { recomputeCreature } from '/imports/api/creature/computation/recomputeCreature.js';

export default {
  data(){return {
    theme,
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
  computed: {
    creatureId(){
      return this.$route.params.id;
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

<style lang="css" scoped>
</style>
