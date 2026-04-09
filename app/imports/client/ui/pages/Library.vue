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
            <v-fade-transition
              hide-on-leave
              leave-absolute
            >
              <v-row
                v-if="!librariesReady"
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
              <library-list v-else />
            </v-fade-transition>
          </v-card>
          <div class="d-flex flex-wrap justify-end mt-2">
            <v-btn
              variant="text"
              to="/community-libraries"
            >
              Browse community libraries
            </v-btn>
            <v-btn
              v-if="paidBenefits"
              variant="text"
              data-id="insert-library-collection-button"
              color="accent"
              :loading="loadingInsertLibraryCollection"
              @click="insertLibraryCollectionAction"
            >
              Add Collection
            </v-btn>
          </div>
          <v-btn
            color="accent"
            fixed
            bottom
            right
            data-id="insert-library-button"
            :disabled="!paidBenefits"
            @click="insertLibraryAction"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { autorun, subscribe } from 'vue-meteor-tracker';
import { union } from 'lodash';
import { getUserTier } from '/imports/api/users/patreon/tiers';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import LibraryCollections, { insertLibraryCollection } from '/imports/api/library/LibraryCollections';
import Libraries, { insertLibrary } from '/imports/api/library/Libraries';
import LibraryList from '/imports/client/ui/library/LibraryList.vue';

const store = useStore();
const router = useRouter();

const { ready: librariesReady } = subscribe('libraries');
const loadingInsertLibraryCollection = ref(false);

const { result: paidBenefits } = autorun(() => {
  const tier = getUserTier(Meteor.userId());
  return tier && tier.paidBenefits;
});

const { result: libraryCollections } = autorun(() => {
  const userId = Meteor.userId();
  if (!userId) return undefined;
  const subCollections = (Meteor.user() as any)?.subscribedLibraryCollections || [];
  return LibraryCollections.find({
    $or: [
      { owner: userId },
      { writers: userId },
      { readers: userId },
      { _id: { $in: subCollections }, public: true },
    ]
  }, {
    sort: { name: 1 }
  }).map((libCollection: any) => {
    libCollection.libraryDocuments = Libraries.find({
      _id: { $in: libCollection.libraries },
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
});

const { result: librariesWithoutCollection } = autorun(() => {
  const userId = Meteor.userId();
  if (!libraryCollections.value) return undefined;
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

function insertLibraryAction() {
  if (paidBenefits.value) {
    store.commit('pushDialogStack', {
      component: 'library-creation-dialog',
      elementId: 'insert-library-button',
      async callback(library: any) {
        if (!library) return;
        try {
          const libraryId = await insertLibrary.callAsync(library);
          router.push({
            name: 'singleLibrary',
            params: { id: libraryId },
          });
        } catch (error: any) {
          console.error(error);
          snackbar({ text: error.reason });
        }
      }
    });
  } else {
    store.commit('pushDialogStack', {
      component: 'tier-too-low-dialog',
      elementId: 'insert-library-button',
    });
  }
}

function insertLibraryCollectionAction() {
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
    }
  });
}
</script>
