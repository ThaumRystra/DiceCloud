<template lang="html">
  <dialog-base>
    <template #toolbar>
      <v-toolbar-title>
        {{ mode === 'archive' ? 'Archive' : 'Restore' }}
      </v-toolbar-title>
      <v-spacer />
      <v-btn-toggle
        v-model="mode"
        mandatory
      >
        <v-btn value="archive" append-icon="mdi-archive-arrow-down">
          <span>Archive</span>
        </v-btn>
        <v-btn value="restore" append-icon="mdi-archive-arrow-up-outline">
          <span>Restore</span>
        </v-btn>
      </v-btn-toggle>
    </template>
    <creature-folder-list
      selection
      :creatures="mode === 'archive' ? CreaturesWithNoParty : archiveCreaturesWithNoParty"
      :folders="mode === 'archive' ? folders : archivefolders"
      :selected-creature="selectedCreature"
      @creature-selected="id => selectedCreature = id"
    />
    <template #actions>
      <v-spacer />
      <v-btn
        variant="text"
        :loading="archiveActionLoading"
        :disabled="!numSelected || (mode === 'restore' && characterSlots <= 0)"
        color="primary"
        @click="archiveAction"
      >
        <template v-if="mode === 'restore' && characterSlots <= 0">
          No Character Slots Left
        </template>
        <template v-else>
          {{ mode === 'archive' ? 'Archive' : 'Restore' }}
        </template>
      </v-btn>
      <v-btn
        variant="text"
        @click="$store.dispatch('popDialogStack')"
      >
        Close
      </v-btn>
    </template>
  </dialog-base>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { autorun, subscribe } from 'vue-meteor-tracker';
import { uniq, flatten } from 'lodash';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureFolders from '/imports/api/creature/creatureFolders/CreatureFolders';
import CreatureFolderList from '/imports/client/ui/creature/creatureList/CreatureFolderList.vue';
import ArchiveCreatureFiles from '/imports/api/creature/archive/ArchiveCreatureFiles';
import archiveCreatureToFile from '/imports/api/creature/archive/methods/archiveCreatureToFile';
import restoreCreatureFromFile from '/imports/api/creature/archive/methods/restoreCreatureFromFile';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import { characterSlotsRemaining } from '/imports/api/creature/creatures/methods/assertHasCharacterSlots';

const characterTransform = (char: any) => {
  char.url = `/character/${char._id}/${char.urlName || '-'}`;
  char.initial = char.name && char.name[0] || '?';
  return char;
};

const fileTransform = (file: any) => ({
  _id: file._id,
  name: file.meta.creatureName,
  owner: file.userId,
  creatureId: file.meta.creatureId,
});

const creatureFields = {
  'color': 1,
  'avatarPicture': 1,
  'name': 1,
  'initial': 1,
  'alignment': 1,
  'gender': 1,
  'race': 1,
  'readers': 1,
  'writers': 1,
  'owner': 1,
};

const selectedCreature = ref<string | null>(null);
const mode = ref<string>('archive');
const archiveActionLoading = ref(false);

const numSelected = computed(() => selectedCreature.value ? 1 : 0);

watch(mode, () => {
  selectedCreature.value = null;
});

autorun(() => {
  subscribe('archivedCreatures');
  subscribe('archiveCreatureFiles');
  subscribe('characterList');
});

const { result: characterSlots } = autorun(() =>
  characterSlotsRemaining(Meteor.userId())
);

const { result: folders } = autorun(() => {
  const userId = Meteor.userId();
  let result = CreatureFolders.find(
    { owner: userId, archived: { $ne: true } },
    { sort: { left: 1 } },
  ).map((folder: any) => {
    folder.creatures = Creatures.find(
      {
        _id: { $in: folder.creatures || [] },
        owner: userId,
      }, {
        sort: { name: 1 },
        fields: creatureFields,
      }
    ).map(characterTransform);
    return folder;
  });
  return result.filter((folder: any) => !!folder.creatures.length);
});

const { result: CreaturesWithNoParty } = autorun(() => {
  const userId = Meteor.userId();
  const charArrays = CreatureFolders.find({ owner: userId }).map((p: any) => p.creatures);
  const folderChars = uniq(flatten(charArrays));
  return Creatures.find(
    {
      _id: { $nin: folderChars },
      owner: userId,
    }, {
      sort: { name: 1 },
      fields: creatureFields,
    }
  ).map(characterTransform);
});

const { result: archivefolders } = autorun(() => {
  const userId = Meteor.userId();
  let result = CreatureFolders.find(
    { owner: userId },
    { sort: { left: 1 } },
  ).map((folder: any) => {
    folder.creatures = ArchiveCreatureFiles.find(
      {
        'meta.creatureId': { $in: folder.creatures || [] },
        userId,
      }, {
        sort: { 'meta.creatureName': 1 },
      }
    ).map(fileTransform);
    return folder;
  });
  return result.filter((folder: any) => !!folder.creatures.length);
});

const { result: archiveCreaturesWithNoParty } = autorun(() => {
  const userId = Meteor.userId();
  const charArrays = CreatureFolders.find({ owner: userId }).map((p: any) => p.creatures);
  const folderChars = uniq(flatten(charArrays));
  return ArchiveCreatureFiles.find(
    {
      'meta.creatureId': { $nin: folderChars },
      userId,
    }, {
      sort: { 'meta.creatureName': 1 },
    }
  ).map(fileTransform);
});

async function archiveAction() {
  if (!selectedCreature.value) return;
  archiveActionLoading.value = true;
  try {
    if (mode.value === 'archive') {
      await archiveCreatureToFile.callAsync({ creatureId: selectedCreature.value });
    } else if (mode.value === 'restore') {
      await restoreCreatureFromFile.callAsync({ fileId: selectedCreature.value });
    }
  } catch (error: any) {
    console.error(error);
    snackbar({ text: error.reason });
  }
  archiveActionLoading.value = false;
  selectedCreature.value = null;
}
</script>

<style lang="css" scoped>
</style>
