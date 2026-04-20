<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { autorun, subscribe } from 'vue-meteor-tracker';
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureFolders from '/imports/api/creature/creatureFolders/CreatureFolders';
import { getUserTierAsync } from '/imports/api/users/patreon/tiers';
import insertCreatureFolder from '/imports/api/creature/creatureFolders/methods/insertCreatureFolder'; 
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import CreatureFolderList from '/imports/client/ui/creature/creatureList/CreatureFolderList.vue';
import ArchiveButton from '/imports/client/ui/creature/creatureList/ArchiveButton.vue';
import getCreatureUrlName from '/imports/api/creature/creatures/getCreatureUrlName';
import { uniq, flatten } from 'lodash';
import { key } from '/imports/client/ui/vuexStore';

const store = useStore(key);

const characterTransform = function (char: any) {
  char.url = `/character/${char._id}/${getCreatureUrlName(char)}`;
  char.initial = char.name && char.name[0] || '?';
  return char;
};

subscribe('characterList');

const loadingInsertFolder = ref(false);

const { result: folders } = autorun(() => {
  const userId = Meteor.userId();
  return CreatureFolders.find(
    { owner: userId, archived: { $ne: true } },
    { sort: { name: 1 } },
  ).map((folder: any) => {
    folder.creatures = Creatures.find(
      {
        _id: { $in: folder.creatures || [] },
        $or: [{ readers: userId }, { writers: userId }, { owner: userId }],
      }, {
      sort: { name: 1 },
    }
    ).map(characterTransform);
    return folder;
  });
});

watch(() => folders.value,
  (folders) => {
    console.log({ folders })
  })

const { result: CreaturesWithNoParty } = autorun(() => {
  const userId = Meteor.userId();
  const charArrays = CreatureFolders.find({ owner: userId }).map((p: any) => p.creatures);
  const folderChars = uniq(flatten(charArrays));
  return Creatures.find(
    {
      _id: { $nin: folderChars },
      $or: [{ readers: userId }, { writers: userId }, { owner: userId }],
    },
    { sort: { name: 1 } }
  ).map(characterTransform);
});

const { result: creatureCount } = autorun(() => {
  const userId = Meteor.userId();
  return Creatures.find({
    owner: userId,
  }, {
    fields: { _id: 1 },
  }).count();
});

const { result: tier } = autorun(() => {
  const userId = Meteor.userId();
  return getUserTierAsync(userId);
});

const characterSpaceLeft = computed(() => {
  const t = tier.value;
  if (!t) return 0;
  if (t.characterSlots === -1) return Number.POSITIVE_INFINITY;
  return t.characterSlots - (creatureCount.value ?? 0);
});

const showImportButton = computed(() => !Meteor.settings.public?.disallowCreatureApiImport);

function insertCharacter() {
  store.commit('pushDialogStack', {
    component: 'character-creation-dialog',
    elementId: 'new-character-button',
    callback: (creatureId: string) => creatureId,
  });
}

function importCharacter() {
  store.commit('pushDialogStack', {
    component: 'character-import-dialog',
    elementId: 'import-character-button',
    callback: (creatureId: string) => creatureId,
  });
}

async function insertFolder() {
  loadingInsertFolder.value = true;
  try {
    await insertCreatureFolder.callAsync();
  } catch (error: any) {
    console.error(error);
    snackbar({ text: error.reason });
  }
  loadingInsertFolder.value = false;
}
</script>

<template>
  <div
    class="card-background"
    style="height: 100%"
  >
    <v-container>
      <v-row
        justify="center"
        class="mb-16"
      >
        <v-col
          cols="12"
          xl="8"
        >
          <v-alert
            v-if="characterSpaceLeft < 0"
            type="error"
          >
            You have exceeded your maximum number of character slots, archive or delete
            some characters.
          </v-alert>
          <v-alert
            v-else-if="characterSpaceLeft === 0"
            type="info"
          >
            You have hit your maximum number of characters.
            <archive-button
              size="small"
              variant="text"
              class="mx-2"
            />
            or
            <v-btn
              href="https://www.patreon.com/join/dicecloud/"
              class="mx-2"
              target="_blank"
              size="small"
              variant="text"
              append-icon="mdi-patreon"
            >
              Increase Patreon tier
            </v-btn>
          </v-alert>
          <v-card :class="{ 'mb-4': folders && folders.length }">
            <creature-folder-list
              :creatures="CreaturesWithNoParty"
              :folders="folders"
            />
          </v-card>
          <div class="d-flex justify-end mt-2">
            <v-btn
              v-if="showImportButton"
              variant="text"
              data-id="import-character-button"
              @click="importCharacter"
            >
              import character
            </v-btn>
            <v-btn
              variant="text"
              :loading="loadingInsertFolder"
              @click="insertFolder"
            >
              add folder
            </v-btn>
          </div>
          <v-btn
            color="accent"
            fixed
            location="bottom right"
            
            data-id="new-character-button"
            :disabled="characterSpaceLeft <= 0"
            @click="insertCharacter"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
