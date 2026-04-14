<template lang="html">
  <dialog-base>
    <template #toolbar>
      <v-toolbar-title>
        {{ model && model.name }}
      </v-toolbar-title>
      <v-spacer />
      <v-btn
        icon
        data-id="share-library-button"
        :disabled="!isOwner"
        @click="share"
      >
        <v-icon>mdi-share-variant</v-icon>
      </v-btn>
      <v-btn
        icon
        data-id="delete-library-button"
        :disabled="!isOwner"
        @click="remove"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </template>
    <template v-if="model">
      <v-list-item
        v-if="!isOwner"
        class="px-0"
        lines="two"
      >
        <template #prepend>
          <v-icon>
            mdi-account
          </v-icon>
        </template>
        <v-list-item-title>
          {{ ownerName || '?' }}
        </v-list-item-title>
        <v-list-item-subtitle>
          Collection owner
        </v-list-item-subtitle>
      </v-list-item>
      <text-field
        label="name"
        :value="model.name"
        @change="(name, ack) => updateLibraryCollection({ name }, ack)"
      />
      <text-area
        label="Description"
        :value="model.description"
        @change="(description, ack) => updateLibraryCollection({ description }, ack)"
      />
      <smart-switch
        :value="model.showInMarket"
        :disabled="!isOwner"
        label="Show in community library browser"
        @change="(showInMarket, ack) => updateLibraryCollection({ showInMarket }, ack)"
      />
      <smart-select
        label="Libraries"
        :items="libraryOptions"
        :value="model.libraries"
        :debounce-time="0"
        multiple
        chips
        deletable-chips
        no-data-text="No libraries found"
        @change="(libraries, ack) => updateLibraryCollection({ libraries }, ack)"
      />
    </template>
    <template #actions>
      <v-spacer />
      <v-btn
        variant="text"
        data-id="delete-library-button"
        @click="$store.dispatch('popDialogStack')"
      >
        Done
      </v-btn>
    </template>
  </dialog-base>
</template>

<script setup lang="ts">
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { autorun } from 'vue-meteor-tracker';
import { Meteor } from 'meteor/meteor';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import LibraryCollections, { updateLibraryCollection, removeLibraryCollection } from '/imports/api/library/LibraryCollections';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import Libraries from '/imports/api/library/Libraries';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{ _id: string }>();
const store = useStore(key);
const router = useRouter();

autorun(() => {
  Meteor.subscribe('libraries');
  Meteor.subscribe('libraryCollection', props._id);
});

const { result: model } = autorun(() => LibraryCollections.findOne(props._id));

const { result: libraryOptions } = autorun(() => {
  const userId = Meteor.userId();
  return Libraries.find(
    {
      $or: [
        { owner: userId },
        { writers: userId },
        { readers: userId },
        { public: true },
      ]
    },
    { sort: { name: 1 } }
  ).map((library: any) => ({ text: library.name, value: library._id }));
});

const { result: isOwner } = autorun(() => {
  if (!model.value) return;
  return Meteor.userId() === model.value.owner;
});

const { result: ownerName } = autorun(() => {
  if (!model.value) return;
  return Meteor.users.findOne(model.value.owner)?.username;
});

async function updateLibraryCollectionFn(update: any, ack: (error?: any) => void) {
  try {
    await updateLibraryCollection.callAsync({ _id: props._id, update });
    ack();
  } catch (error: any) {
    ack(error.reason || error);
  }
}

function remove() {
  store.commit('pushDialogStack', {
    component: 'delete-confirmation-dialog',
    elementId: 'delete-library-button',
    data: { name: model.value?.name, typeName: 'Collection' },
    async callback(confirmation: any) {
      if (!confirmation) return;
      try {
        await removeLibraryCollection.callAsync({ _id: props._id });
        router.push({ name: 'library', replace: true });
        store.dispatch('popDialogStack');
      } catch (error: any) {
        console.error(error);
        snackbar({ text: error.reason });
      }
    },
  });
}

function share() {
  store.commit('pushDialogStack', {
    component: 'share-dialog',
    elementId: 'share-library-button',
    data: { docRef: { id: props._id, collection: 'libraryCollections' } },
  });
}
</script>

<style lang="css" scoped></style>
