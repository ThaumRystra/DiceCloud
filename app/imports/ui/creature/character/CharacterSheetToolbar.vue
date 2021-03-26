<template lang="html">
  <v-app-bar
    app
    class="character-sheet-toolbar"
    :color="toolbarColor"
    :dark="isDark"
    :light="!isDark"
    clipped-right
    extended
    tabs
    dense
  >
    <v-app-bar-nav-icon @click="toggleDrawer" />
    <v-app-bar-title>
      <v-fade-transition
        mode="out-in"
      >
        <div :key="$store.state.pageTitle">
          {{ $store.state.pageTitle }}
        </div>
      </v-fade-transition>
    </v-app-bar-title>
    <v-spacer />
    <v-fade-transition
      mode="out-in"
    >
      <div :key="$route.meta.title">
        <template v-if="creature">
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
              <v-list-item @click="deleteCharacter">
                <v-list-item-title>
                  <v-icon>delete</v-icon> Delete
                </v-list-item-title>
              </v-list-item>
              <v-list-item @click="showCharacterForm">
                <v-list-item-title>
                  <v-icon>create</v-icon> Edit details
                </v-list-item-title>
              </v-list-item>
              <v-list-item @click="showShareDialog">
                <v-list-item-title>
                  <v-icon>share</v-icon> Sharing
                </v-list-item-title>
              </v-list-item>
            </v-list>
            <v-list v-else>
              <v-list-item @click="unshareWithMe">
                <v-list-item-title>
                  <v-icon>delete</v-icon> Unshare with me
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-app-bar-nav-icon @click="toggleRightDrawer" />
        </template>
      </div>
    </v-fade-transition>
    <v-fade-transition
      slot="extension"
      mode="out-in"
    >
      <div
        :key="$route.meta.title"
        class="layout"
      >
        <v-tabs
          v-if="creature"
          class="flex"
          style="min-width: 0"
          centered
          grow
          max="100px"
          :color="$vuetify.theme.themes.dark.primary"
          :value="$store.getters.tabById($route.params.id)"
          :background-color="toolbarColor"
          @change="e => $store.commit(
            'setTabForCharacterSheet',
            {id: $route.params.id, tab: e}
          )"
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
            Character
          </v-tab>
          <v-tab>
            Tree
          </v-tab>
        </v-tabs>
        <v-spacer />
        <character-sheet-fab
          class="character-sheet-fab"
          :edit-permission="editPermission"
        />
      </div>
    </v-fade-transition>
  </v-app-bar>
</template>

<script lang="js">
import Creatures from '/imports/api/creature/Creatures.js';
import removeCreature from '/imports/api/creature/removeCreature.js';
import { mapMutations } from 'vuex';
import { assertEditPermission } from '/imports/api/creature/creaturePermissions.js';
import { updateUserSharePermissions } from '/imports/api/sharing/sharing.js';
import isDarkColor from '/imports/ui/utility/isDarkColor.js';
import CharacterSheetFab from '/imports/ui/creature/character/CharacterSheetFab.vue';

export default {
  inject: {
    context: { default: {} }
  },
  components: {
    CharacterSheetFab,
  },
  computed: {
    creatureId(){
      return this.$route.params.id;
    },
    toolbarColor(){
      if (this.creature && this.creature.color){
        return this.creature.color;
      } else {
        return this.$vuetify.theme.themes.light.secondary;
      }
    },
    isDark(){
      return isDarkColor(this.toolbarColor);
    },
  },
  methods: {
    ...mapMutations([
      'toggleDrawer',
      'toggleRightDrawer',
    ]),
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
.character-sheet-fab {
  bottom: -24px;
  margin-right: -8px;
}
</style>
