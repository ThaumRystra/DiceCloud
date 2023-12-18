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
    <v-list-item v-if="!$subReady.libraries">
      <v-spacer />
      <v-progress-circular
        indeterminate
        color="primary"
      />
      <v-spacer />
    </v-list-item>
  </v-list>
</template>

<script lang="js">
import { union } from 'lodash';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import LibraryCollections, { insertLibraryCollection } from '/imports/api/library/LibraryCollections';
import Libraries, { insertLibrary } from '/imports/api/library/Libraries';
import LibraryListTile from '/imports/client/ui/library/LibraryListTile.vue'
import LibraryCollectionHeader from '/imports/client/ui/library/LibraryCollectionHeader.vue';

export default {
  components: {
    LibraryListTile,
    LibraryCollectionHeader,
  },
  props: {
    selection: Boolean,
    singleSelect: Boolean,
    disabled: Boolean,
    librariesSelected: {
      type: Array,
      default: undefined,
    },
    libraryCollectionsSelected: {
      type: Array,
      default: undefined,
    },
    librariesSelectedByCollections: {
      type: Array,
      default: undefined,
    },
  },
  data(){ return{
    loadingInsertLibraryCollection: false,
    openCollections: [],
  }},
  meteor: {
    $subscribe: {
      'libraries': [],
    },
    libraryCollections(){
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
      }, {
        sort: { name: 1 }
      }).map(libCollection => {
        libCollection.libraryDocuments = Libraries.find({
          _id: {$in: libCollection.libraries},
          $or: [
            { owner: userId },
            { writers: userId },
            { readers: userId },
            { public: true },
          ]
        }, {
          sort: { name: 1 }
        }).fetch();
        return libCollection;
      });
    },
    librariesWithoutCollection() {
      const userId = Meteor.userId();
      if (!this.libraryCollections) return;
      // Collate the IDs of all the libraries in collections
      let collectedLibraries = [];
      this.libraryCollections.forEach(libCollection => {
        collectedLibraries = union(collectedLibraries, libCollection.libraries);
      });
      // return the libraries with IDs not in that list
      return Libraries.find(
        {
          _id: {$nin: collectedLibraries},
          $or: [
            { owner: userId },
            { writers: userId },
            { readers: userId },
            { public: true },
          ]
        },
        {sort: {name: 1}}
      );
    },
  },
  methods: {
    insertLibrary() {
      const self = this;
      if (this.paidBenefits){
        this.$store.commit('pushDialogStack', {
          component: 'library-creation-dialog',
          elementId: 'insert-library-button',
          callback(library){
            if (!library) return;
            return insertLibrary.call(library, (error, libraryId) => {
              if (error){
                console.error(error);
                snackbar({
                  text: error.reason,
                });
              } else {
                self.$router.push({
                  name: 'singleLibrary',
                  params: { id: libraryId }
                });
              }
            });
          }
        });
      } else {
        this.$store.commit('pushDialogStack', {
          component: 'tier-too-low-dialog',
          elementId: 'insert-library-button',
        });
      }
    },
    insertLibraryCollection() {
      this.$store.commit('pushDialogStack', {
        component: 'library-collection-creation-dialog',
        elementId: 'insert-library-collection-button',
        callback(libraryCollection){
          if (!libraryCollection) return;
          const id = insertLibraryCollection.call(libraryCollection, error => {
            if (!error) return;
            console.error(error);
            snackbar({
              text: error.reason,
            });
          });
          return `library-collection-${id}`
        }
      });
    },
  },
};
</script>
