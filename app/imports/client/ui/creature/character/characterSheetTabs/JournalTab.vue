<template>
  <div class="build-tab">
    <column-layout wide-columns>
      <folder-group-card
        v-for="folder in startFolders"
        :key="folder._id"
        :model="folder"
        @click-property="clickProperty"
        @sub-click="_id => clickTreeProperty({ _id })"
        @remove="softRemove"
      />
      <div v-if="creature">
        <creature-summary :creature="creature" />
      </div>
      <div
        v-for="note in notes"
        :key="note._id"
      >
        <note-card :model="note" />
      </div>
      <folder-group-card
        v-for="folder in endFolders"
        :key="folder._id"
        :model="folder"
        @click-property="clickProperty"
        @sub-click="_id => clickTreeProperty({ _id })"
        @remove="softRemove"
      />
    </column-layout>
  </div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import ColumnLayout from '/imports/client/ui/components/ColumnLayout.vue';
import Creatures from '/imports/api/creature/creatures/Creatures';
import NoteCard from '/imports/client/ui/properties/components/persona/NoteCard.vue';
import CreatureSummary from '/imports/client/ui/creature/character/CreatureSummary.vue';
import FolderGroupCard from '/imports/client/ui/properties/components/folders/FolderGroupCard.vue';
import CreatureProperties, { type CreaturePropertyTypes } from '/imports/api/creature/creatureProperties/CreatureProperties';
import softRemoveProperty from '/imports/api/creature/creatureProperties/methods/softRemoveProperty';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import { getFilter } from '/imports/api/parenting/parentingFunctions';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{ creatureId: string }>();
const store = useStore(key);
const tabName = 'journal';

const { result: startFolders } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    groupStats: true,
    inactive: { $ne: true },
    removed: { $ne: true },
    tab: tabName,
    location: 'start',
  }, { sort: { left: 1 } }).fetch()
);

const { result: endFolders } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    groupStats: true,
    inactive: { $ne: true },
    removed: { $ne: true },
    tab: tabName,
    location: 'end',
  }, { sort: { left: 1 } }).fetch()
);

const { result: creature } = autorun(() =>
  Creatures.findOne(props.creatureId)
);

const { result: notes } = autorun(() => {
  const folderIds = CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    type: 'folder',
    groupStats: true,
    hideStatsGroup: true,
    removed: { $ne: true },
    inactive: { $ne: true },
  }, { fields: { _id: 1 } }).map((folder: any) => folder._id);

  const noteFilter = {
    ...getFilter.descendantsOfRoot(props.creatureId),
    'parentId': { $nin: folderIds },
    type: 'note',
    removed: { $ne: true },
    inactive: { $ne: true },
  } as Mongo.Selector<CreaturePropertyTypes['note']>;
  const allNotes = CreatureProperties.find(noteFilter, { sort: { left: 1 } }).fetch() as CreaturePropertyTypes['note'][];

  return CreatureProperties.find({
    ...noteFilter,
    ...getFilter.descendantsOfRoot(props.creatureId),
    $nor: [getFilter.descendantsOfAll(allNotes)],
  }, {
    sort: { left: 1 },
  }).fetch();
});

function clickProperty({ _id }: { _id: string }) {
  store.commit('pushDialogStack', {
    component: 'creature-property-dialog',
    elementId: `${_id}`,
    data: { _id },
  });
}

function clickTreeProperty({ _id }: { _id: string }) {
  store.commit('pushDialogStack', {
    component: 'creature-property-dialog',
    elementId: `tree-node-${_id}`,
    data: { _id },
  });
}

function softRemove(_id: string) {
  softRemoveProperty.call({ _id }, (error: any) => {
    if (error) {
      snackbar({ text: error.reason || error.message || error.toString() });
      console.error(error);
    }
  });
}
</script>

<style lang="css" scoped></style>
