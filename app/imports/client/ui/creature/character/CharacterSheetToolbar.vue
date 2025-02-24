<template lang="html">
  <v-app-bar
    app
    class="character-sheet-toolbar"
    :color="toolbarColor"
    :dark="isDark"
    :light="!isDark"
    clipped-right
    :extended="$vuetify.breakpoint.smAndUp"
    :tabs="$vuetify.breakpoint.smAndUp"
    dense
  >
    <v-app-bar-nav-icon @click="toggleDrawer" />
    <v-fade-transition mode="out-in">
      <v-toolbar-title :key="$store.state.pageTitle">
        {{ $store.state.pageTitle }}
      </v-toolbar-title>
    </v-fade-transition>
    <v-spacer />
    <v-fade-transition mode="out-in">
      <v-layout
        :key="$route.meta.title"
        class="flex-shrink-0 flex-grow-0"
        justify-end
      >
        <template v-if="creature">
          <shared-icon :model="creature" />
          <v-menu
            bottom
            left
            transition="slide-y-transition"
          >
            <template #activator="{ on }">
              <v-btn
                data-id="creature-menu"
                icon
                v-on="on"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-if="!isOwner && ownerName"
                two-line
                disabled
              >
                <v-list-item-avatar>
                  <v-icon>
                    mdi-account
                  </v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ ownerName }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ $t('CharacterSheetToolbar.emdD3PkZeGh4DggsQ8gXu') }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                v-if="!isOwner"
                @click="unshareWithMe"
              >
                <v-list-item-title>
                  <v-icon left>
                    mdi-cancel
                  </v-icon> {{ $t('CharacterSheetToolbar.VQpJOOSLj9jVu_Ug2VkdW') }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item :to="printUrl">
                <v-list-item-title>
                  <v-icon left>
                    mdi-printer
                  </v-icon> {{ $t('CharacterSheetToolbar.MEKfUHv4LuBXm7IaA_y2M') }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item @click="showCharacterForm">
                <v-list-item-title>
                  <v-icon left>
                    mdi-pencil
                  </v-icon> {{ $t('CharacterSheetToolbar.RTIYpVmEiPR-12DHpABiN') }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item
                :disabled="!isOwner"
                @click="showShareDialog"
              >
                <v-list-item-title>
                  <v-icon left>
                    mdi-share-variant
                  </v-icon> {{ $t('ShareDialog.03VciIdW7WUj5zao5xU0A') }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item
                :disabled="!isOwner"
                @click="deleteCharacter"
              >
                <v-list-item-title>
                  <v-icon left>
                    mdi-delete
                  </v-icon> {{ $t('DocEditForm.pblwi8OgupFn22G1Nw-oY') }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-app-bar-nav-icon @click="toggleRightDrawer">
            <v-icon>mdi-forum</v-icon>
          </v-app-bar-nav-icon>
        </template>
      </v-layout>
    </v-fade-transition>
    <v-fade-transition
      v-if="$vuetify.breakpoint.smAndUp"
      slot="extension"
      mode="out-in"
    >
      <div
        :key="$route.meta.title"
        class="layout"
      >
        <v-tabs
          v-if="creature && creature.settings"
          :key=" '' +
            creature.settings.hideSpellsTab +
            creature.settings.showTreeTab
          "
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
            {{ $t('CharacterSheetDialog.NnBUF4ZwE2sxY2H9laU5t') }}
          </v-tab>
          <v-tab>
            {{ $t('CharacterSheetDialog.uEahuOj2R9wGkNQ-mmdBa') }}
          </v-tab>
          <v-tab v-if="!creature.settings.hideSpellsTab">
            {{ $t('CharacterSheetDialog.D7iHe3wbPaZ2Jhsn9CXU8') }}
          </v-tab>
          <v-tab>
            {{ $t('CharacterSheetDialog.0E9n7NRcJsKcvSOh8pJGk') }}
          </v-tab>
          <v-tab>
            {{ $t('CharacterSheetDialog.7PhUWMOg_8wLLCCY7CKDz') }}
          </v-tab>
          <v-tab>
            {{ $t('CharacterSheetDialog.KOKK1cNcrY6O64cRo8aKa') }}
          </v-tab>
          <v-tab>
            {{ $t('CharacterSheetDialog.biA0vlRWylo6EW8GckGOx') }}
          </v-tab>
          <v-tab v-if="creature.settings.showTreeTab">
            {{ $t('CharacterSheet.PaDxTX6-CoFfTji1AYSHv') }}
          </v-tab>
        </v-tabs>
        <v-spacer />
        <character-sheet-fab
          direction="bottom"
          class="character-sheet-extension-fab"
          :edit-permission="editPermission"
        />
      </div>
    </v-fade-transition>
  </v-app-bar>
</template>

<script lang="js">
import Creatures from '/imports/api/creature/creatures/Creatures';
import removeCreature from '/imports/api/creature/creatures/methods/removeCreature';
import { mapMutations } from 'vuex';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions';
import { updateUserSharePermissions } from '/imports/api/sharing/sharing';
import isDarkColor from '/imports/client/ui/utility/isDarkColor';
import CharacterSheetFab from '/imports/client/ui/creature/character/CharacterSheetFab.vue';
import getThemeColor from '/imports/client/ui/utility/getThemeColor';
import SharedIcon from '/imports/client/ui/components/SharedIcon.vue';
import getCreatureUrlName from '/imports/api/creature/creatures/getCreatureUrlName';

export default {
  components: {
    CharacterSheetFab,
    SharedIcon,
  },
  inject: {
    context: { default: {} }
  },
  computed: {
    creatureId() {
      return this.$route.params.id;
    },
    toolbarColor() {
      if (this.creature && this.creature.color) {
        return this.creature.color;
      } else {
        return getThemeColor('secondary');
      }
    },
    isDark() {
      return isDarkColor(this.toolbarColor);
    },
    printUrl() {
      return `/print-character/${this.creature._id}/${getCreatureUrlName(this.creature)}`;
    },
  },
  methods: {
    ...mapMutations([
      'toggleDrawer',
      'toggleRightDrawer',
    ]),
    showCharacterForm() {
      this.$store.commit('pushDialogStack', {
        component: 'creature-form-dialog',
        elementId: 'creature-menu',
        data: {
          _id: this.creatureId,
        },
      });
    },
    showShareDialog() {
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
    deleteCharacter() {
      let that = this;
      this.$store.commit('pushDialogStack', {
        component: 'delete-confirmation-dialog',
        elementId: 'creature-menu',
        data: {
          name: this.creature.name,
          typeName: this.$t('CharacterSheetToolbar.sI8Ova8fMZEX_gVBZX6xH')
        },
        callback(confirmation) {
          if (!confirmation) return;
          removeCreature.call({ charId: that.creatureId }, (error) => {
            if (error) {
              console.error(error);
            } else {
              that.$router.push('/characterList');
            }
          });
        }
      });
    },
    unshareWithMe() {
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
    creature() {
      return Creatures.findOne(this.creatureId);
    },
    editPermission() {
      try {
        assertEditPermission(this.creature, Meteor.userId());
        return true;
      } catch (e) {
        return false;
      }
    },
    isOwner() {
      if (!this.creature) return;
      return Meteor.userId() === this.creature.owner;
    },
    ownerName() {
      if (!this.creature) return;
      const username = Meteor.users.findOne(this.creature.owner)?.username;
      return username;
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

.character-sheet-extension-fab {
  bottom: -24px;
  right: 8px;
  margin-left: 16px;
}
</style>
