<template lang="html">
  <v-app-bar
    class="character-sheet-toolbar"
    :color="toolbarColor"
    :theme="isDark ? 'dark' : 'light'"
    density="compact"
  >
    <v-app-bar-nav-icon @click="toggleDrawer" />
    <v-fade-transition mode="out-in">
      <v-toolbar-title :key="$store.state.pageTitle">
        {{ $store.state.pageTitle }}
      </v-toolbar-title>
    </v-fade-transition>
    <v-spacer />
    <v-fade-transition mode="out-in">
      <div
        :key="$route.meta.title"
        class="d-flex flex-shrink-0 flex-grow-0 justify-end"
      >
        <template v-if="creature">
          <shared-icon :model="creature" />
          <v-menu
            location="bottom end"
            transition="slide-y-transition"
          >
            <template #activator="{ props }">
              <v-btn
                data-id="creature-menu"
                icon="mdi-dots-vertical"
                v-bind="props"
              />
            </template>
            <v-list>
              <v-list-item
                v-if="!isOwner && ownerName"
                lines="two"
                disabled
              >
                <template #prepend>
                  <v-icon>
                    mdi-account
                  </v-icon>
                </template>
                <v-list-item-title>
                  {{ ownerName }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  Sheet owner
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item
                v-if="!isOwner"
                @click="unshareWithMe"
              >
                <template #prepend>
                  <v-icon>mdi-cancel</v-icon>
                </template>
                <v-list-item-title>
                  Unshare with me
                </v-list-item-title>
              </v-list-item>
              <v-list-item :to="printUrl">
                <template #prepend>
                  <v-icon>mdi-printer</v-icon>
                </template>
                <v-list-item-title>
                  Print
                </v-list-item-title>
              </v-list-item>
              <v-list-item @click="showCharacterForm">
                <template #prepend>
                  <v-icon>mdi-pencil</v-icon>
                </template>
                <v-list-item-title>
                  Edit details
                </v-list-item-title>
              </v-list-item>
              <v-list-item
                :disabled="!isOwner"
                @click="showShareDialog"
              >
                <template #prepend>
                  <v-icon>mdi-share-variant</v-icon>
                </template>
                <v-list-item-title>
                  Sharing
                </v-list-item-title>
              </v-list-item>
              <v-list-item
                :disabled="!isOwner"
                @click="deleteCharacter"
              >
                <template #prepend>
                  <v-icon>mdi-delete</v-icon>
                </template>
                <v-list-item-title>
                  Delete
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-app-bar-nav-icon @click="toggleRightDrawer">
            <v-icon>mdi-forum</v-icon>
          </v-app-bar-nav-icon>
        </template>
      </div>
    </v-fade-transition>
    <template #extension>
      <v-fade-transition
        v-if="$vuetify.display.smAndUp"
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
          :color="$vuetify.theme.themes?.dark?.colors?.primary"
          :model-value="$store.getters.tabById($route.params.id)"
          :bg-color="toolbarColor"
          @update:model-value="e => $store.commit(
            'setTabForCharacterSheet',
            {id: $route.params.id, tab: e}
          )"
        >
          <v-tab>
            Stats
          </v-tab>
          <v-tab>
            Actions
          </v-tab>
          <v-tab v-if="!creature.settings.hideSpellsTab">
            Spells
          </v-tab>
          <v-tab>
            Inventory
          </v-tab>
          <v-tab>
            Features
          </v-tab>
          <v-tab>
            Journal
          </v-tab>
          <v-tab>
            Build
          </v-tab>
          <v-tab v-if="creature.settings.showTreeTab">
            Tree
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
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { autorun } from 'vue-meteor-tracker';
import Creatures from '/imports/api/creature/creatures/Creatures';
import removeCreature from '/imports/api/creature/creatures/methods/removeCreature';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions';
import { updateUserSharePermissions } from '/imports/api/sharing/sharing';
import isDarkColor from '/imports/client/ui/utility/isDarkColor';
import CharacterSheetFab from '/imports/client/ui/creature/character/CharacterSheetFab.vue';
import getThemeColor from '/imports/client/ui/utility/getThemeColor';
import SharedIcon from '/imports/client/ui/components/SharedIcon.vue';
import getCreatureUrlName from '/imports/api/creature/creatures/getCreatureUrlName';

const store = useStore();
const route = useRoute();
const router = useRouter();

const creatureId = computed(() => route.params.id as string);

const { result: creature } = autorun(() =>
  Creatures.findOne(creatureId.value)
);

const { result: editPermission } = autorun(() => {
  try {
    assertEditPermission(creature.value, Meteor.userId());
    return true;
  } catch (e) {
    return false;
  }
});

const { result: isOwner } = autorun(() => {
  if (!creature.value) return undefined;
  return Meteor.userId() === creature.value.owner;
});

const { result: ownerName } = autorun(() => {
  if (!creature.value) return undefined;
  return Meteor.users.findOne(creature.value.owner)?.username;
});

const toolbarColor = computed(() => {
  if (creature.value?.color) return creature.value.color;
  return getThemeColor('secondary');
});

const isDark = computed(() => isDarkColor(toolbarColor.value));

const printUrl = computed(() => {
  if (!creature.value) return '';
  return `/print-character/${creature.value._id}/${getCreatureUrlName(creature.value)}`;
});

function toggleDrawer() {
  store.commit('toggleDrawer');
}

function toggleRightDrawer() {
  store.commit('toggleRightDrawer');
}

function showCharacterForm() {
  store.commit('pushDialogStack', {
    component: 'creature-form-dialog',
    elementId: 'creature-menu',
    data: { _id: creatureId.value },
  });
}

function showShareDialog() {
  store.commit('pushDialogStack', {
    component: 'share-dialog',
    elementId: 'creature-menu',
    data: {
      docRef: {
        id: creatureId.value,
        collection: 'creatures',
      },
    },
  });
}

function deleteCharacter() {
  const cId = creatureId.value;
  store.commit('pushDialogStack', {
    component: 'delete-confirmation-dialog',
    elementId: 'creature-menu',
    data: {
      name: creature.value?.name,
      typeName: 'Character',
    },
    async callback(confirmation: any) {
      if (!confirmation) return;
      try {
        await removeCreature.callAsync({ charId: cId });
        router.push('/characterList');
      } catch (error) {
        console.error(error);
      }
    },
  });
}

async function unshareWithMe() {
  try {
    await updateUserSharePermissions.callAsync({
      docRef: {
        collection: 'creatures',
        id: creatureId.value,
      },
      userId: Meteor.userId(),
      role: 'none',
    });
    router.push('/characterList');
  } catch (error) {
    console.error(error);
  }
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
