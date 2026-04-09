<template>
  <v-list
    expand
    class="library-list"
  >
    <library-list-tile
      v-for="library in librariesWithoutCollection"
      :key="library._id"
      :model="library"
      :to="{ name: 'singleLibrary', params: { id: library._id }}"
      :selection="selection"
      :single-select="singleSelect"
      :is-selected="librariesSelected && librariesSelected.includes(library._id)"
      :selected-by-collection="librariesSelectedByCollections && librariesSelectedByCollections.includes(library._id)"
      :disabled="disabled"
      @select="val => $emit('select-library', library._id, val)"
    />
    <v-list-group
      v-for="libraryCollection in libraryCollections"
      :key="libraryCollection._id"
      v-model="openCollections[libraryCollection._id]"
      group="library-collection"
      :data-id="`library-collection-${libraryCollection._id}`"
    >
      <template #activator>
        <library-collection-header
          :open="openCollections[libraryCollection._id]"
          :model="libraryCollection"
          :selection="selection"
          :single-select="singleSelect"
          :is-selected="libraryCollectionsSelected && libraryCollectionsSelected.includes(libraryCollection._id)"
          :disabled="disabled"
          @select="val => $emit('select-library-collection', libraryCollection._id, val)"
        />
      </template>
      <library-list-tile
        v-for="library in libraryCollection.libraryDocuments"
        :key="library._id"
        :model="library"
        :to="{ name: 'singleLibrary', params: { id: library._id }}"
        :selection="selection"
        :single-select="singleSelect"
        :is-selected="librariesSelected && librariesSelected.includes(library._id)"
        :selected-by-collection="librariesSelectedByCollections && librariesSelectedByCollections.includes(library._id)"
        :disabled="disabled"
        class="ml-4"
        @select="val => $emit('select-library', library._id, val)"
      />
    </v-list-group>
    <v-list-item v-if="!librariesReady">
      <v-spacer />
      <v-progress-circular
        indeterminate
        color="primary"
      />
      <v-spacer />
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { autorun, subscribe } from 'vue-meteor-tracker';
import { Meteor } from 'meteor/meteor';
import { union } from 'lodash';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import LibraryCollections, { insertLibraryCollection } from '/imports/api/library/LibraryCollections';
import Libraries, { insertLibrary } from '/imports/api/library/Libraries';
import { getUserTier } from '/imports/api/users/patreon/tiers';
import LibraryListTile from '/imports/client/ui/library/LibraryListTile.vue';
import LibraryCollectionHeader from '/imports/client/ui/library/LibraryCollectionHeader.vue';

defineProps<{
  selection?: boolean;
  singleSelect?: boolean;
  disabled?: boolean;
  librariesSelected?: string[];
  libraryCollectionsSelected?: string[];
  librariesSelectedByCollections?: string[];
}>();

const store = useStore();
const router = useRouter();

const openCollections = ref<string[]>([]);

const { ready: librariesReady } = subscribe('libraries');

const { result: paidBenefits } = autorun(() => {
  const tier = getUserTier(Meteor.userId());
  return tier && tier.paidBenefits;
});

const { result: libraryCollections } = autorun(() => {
  const userId = Meteor.userId();
  if (!userId) return;
  const subCollections = Meteor.user()?.subscribedLibraryCollections || [];
  return LibraryCollections.find({
    $or: [
      { owner: userId },
      { writers: userId },
      { readers: userId },
      { _id: { $in: subCollections }, public: true },
    ]
  }, { sort: { name: 1 } }).map((libCollection: any) => {
    libCollection.libraryDocuments = Libraries.find({
      _id: { $in: libCollection.libraries },
      $or: [
        { owner: userId },
        { writers: userId },
        { readers: userId },
        { public: true },
      ]
    }, { sort: { name: 1 } }).fetch();
    return libCollection;
  });
});

const { result: librariesWithoutCollection } = autorun(() => {
  const userId = Meteor.userId();
  if (!libraryCollections.value) return;
  let collectedLibraries: string[] = [];
  libraryCollections.value.forEach((libCollection: any) => {
    collectedLibraries = union(collectedLibraries, libCollection.libraries);
  });
  return Libraries.find(
    {
      _id: { $nin: collectedLibraries },
      $or: [
        { owner: userId },
        { writers: userId },
        { readers: userId },
        { public: true },
      ]
    },
    { sort: { name: 1 } }
  ).fetch();
});

function insertLibraryFn() {
  if (paidBenefits.value) {
    store.commit('pushDialogStack', {
      component: 'library-creation-dialog',
      elementId: 'insert-library-button',
      async callback(library: any) {
        if (!library) return;
        try {
          const libraryId = await insertLibrary.callAsync(library);
          router.push({ name: 'singleLibrary', params: { id: libraryId } });
        } catch (error: any) {
          console.error(error);
          snackbar({ text: error.reason });
        }
      },
    });
  } else {
    store.commit('pushDialogStack', {
      component: 'tier-too-low-dialog',
      elementId: 'insert-library-button',
    });
  }
}

function insertLibraryCollectionFn() {
  store.commit('pushDialogStack', {
    component: 'library-collection-creation-dialog',
    elementId: 'insert-library-collection-button',
    async callback(libraryCollection: any) {
      if (!libraryCollection) return;
      try {
        const id = await insertLibraryCollection.callAsync(libraryCollection);
        return `library-collection-${id}`;
      } catch (error: any) {
        console.error(error);
        snackbar({ text: error.reason });
      }
    },
  });
}
</script>

