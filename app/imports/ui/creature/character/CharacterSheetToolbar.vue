<template lang="html">
  <v-toolbar
    app
    class="character-sheet-toolbar"
    :color="toolbarColor"
    :dark="isDark"
    :light="!isDark"
    tabs
    dense
  >
    <v-toolbar-side-icon @click="toggleDrawer" />
    <v-toolbar-title>
      <v-fade-transition
        mode="out-in"
      >
        <div :key="$store.state.pageTitle">
          {{ $store.state.pageTitle }}
        </div>
      </v-fade-transition>
    </v-toolbar-title>
    <v-spacer />
    <v-fade-transition
      mode="out-in"
    >
      <div :key="$route.meta.title">
        <v-toolbar-items v-if="creature">
          <v-btn
            v-if="editPermission"
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
            <v-list v-if="editPermission">
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
            <v-list v-else>
              <v-list-tile @click="unshareWithMe">
                <v-list-tile-title>
                  <v-icon>delete</v-icon> Unshare with me
                </v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
        </v-toolbar-items>
      </div>
    </v-fade-transition>
    <v-fade-transition
      slot="extension"
      mode="out-in"
    >
      <div
        :key="$route.meta.title"
        style="width: 100%"
      >
        <v-tabs
          v-if="creature"
          slot="extension"
          :value="value"
          centered
          grow
          max="100px"
          @change="e => $emit('input', e)"
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
      </div>
    </v-fade-transition>
  </v-toolbar>
</template>

<script>
import Creatures from '/imports/api/creature/Creatures.js';
import removeCreature from '/imports/api/creature/removeCreature.js';
import { mapMutations } from 'vuex';
import { theme } from '/imports/ui/theme.js';
import { recomputeCreature } from '/imports/api/creature/computation/recomputeCreature.js';
import { assertEditPermission } from '/imports/api/creature/creaturePermissions.js';
import { updateUserSharePermissions } from '/imports/api/sharing/sharing.js';
import isDarkColor from '/imports/ui/utility/isDarkColor.js';

export default {
  props: {
    value: {
      type: Number,
      required: true,
    },
  },
  data(){return {
    theme,
  }},
  computed: {
    creatureId(){
      return this.$route.params.id;
    },
    toolbarColor(){
      if (this.creature && this.creature.color){
        return this.creature.color;
      } else {
        return this.$vuetify.theme.secondary;
      }
    },
    isDark(){
      return isDarkColor(this.toolbarColor);
    },
  },
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
    unshareWithMe(){
      updateUserSharePermissions.call({
        docRef: {
          collection: 'creatures',
          id: this.creatureId,
        },
        userId: Meteor.userId(),
        role: 'none',
      }, (error) => {
        if (error) {
          console.error(error);
        } else {
          this.$router.push('/characterList');
        }
      });
    },
  },
  meteor: {
    $subscribe: {
      'singleCharacter'(){
        return [this.creatureId];
      },
    },
    creature(){
      return Creatures.findOne(this.creatureId);
    },
    editPermission(){
      try {
        assertEditPermission(this.creature, Meteor.userId());
        return true;
      } catch (e) {
        return false;
      }
    },
  },
}
</script>

<style lang="css">
.character-sheet-toolbar .v-tabs__container--grow .v-tabs__div {
  max-width: 120px !important;
}
.character-sheet-toolbar .v-tabs__bar {
  background: none !important;
}
</style>
