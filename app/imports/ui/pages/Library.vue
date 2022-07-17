<template>
  <div
    class="card-background"
    style="height: 100%"
  >
    <v-container>
      <v-row justify="center">
        <v-col
          cols="12"
          xl="8"
        >
          <v-card :class="{'mb-4': libraryCollections && libraryCollections.length}">
            <v-list
              expand
              class="library-folder-list"
            >
              <library-list-tile
                v-for="library in librariesWithoutCollection"
                :key="library._id"
                :model="library"
                :to="{ name: 'singleLibrary', params: { id: library._id }}"
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
                  />
                </template>
                <library-list-tile
                  v-for="library in libraryCollection.libraryDocuments"
                  :key="library._id"
                  :model="library"
                  :to="{ name: 'singleLibrary', params: { id: library._id }}"
                  class="ml-4"
                />
              </v-list-group>
            </v-list>
            <v-expand-transition>
              <v-row
                v-if="!$subReady.libraries"
                align="center"
                justify="center"
                class="pa-4"
              >
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="32"
                />
              </v-row>
            </v-expand-transition>
          </v-card>
          <div class="layout justify-end mt-2">
            <v-btn
              v-if="paidBenefits"
              text
              data-id="insert-library-collection-button"
              :loading="loadingInsertLibraryCollection"
              @click="insertLibraryCollection"
            >
              Add Collection
            </v-btn>
          </div>
          <v-btn
            color="accent"
            fab
            fixed
            bottom
            right
            data-id="insert-library-button"
            :disabled="!paidBenefits"
            @click="insertLibrary"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="js">
import { union } from 'lodash';
import { getUserTier } from '/imports/api/users/patreon/tiers.js';
import { snackbar } from '/imports/ui/components/snackbars/SnackbarQueue.js';
import LibraryCollections, { insertLibraryCollection } from '/imports/api/library/LibraryCollections.js';
import Libraries, { insertLibrary } from '/imports/api/library/Libraries.js';
import LibraryListTile from '/imports/ui/library/LibraryListTile.vue'
import LibraryCollectionHeader from '/imports/ui/library/LibraryCollectionHeader.vue';

export default {
  components: {
    LibraryListTile,
    LibraryCollectionHeader,
  },
  data(){ return{
    loadingInsertLibraryCollection: false,
    openCollections: [],
  }},
  meteor: {
    $subscribe: {
      'libraries': [],
    },
    paidBenefits(){
      let tier = getUserTier(Meteor.userId());
      return tier && tier.paidBenefits;
    },
    libraryCollections(){
      const userId = Meteor.userId();
      if (!userId) return;
      const subCollections = Meteor.user().subscribedLibraryCollections || [];
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
