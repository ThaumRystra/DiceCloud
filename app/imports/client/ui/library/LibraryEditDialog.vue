<script setup lang="ts">
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { autorun, subscribe } from 'vue-meteor-tracker';
import { Meteor } from 'meteor/meteor';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import Libraries, { updateLibraryName, updateLibraryDescription, updateLibraryShowInMarket, removeLibrary } from '/imports/api/library/Libraries';
import LibraryNodes, { restoreLibraryNode } from '/imports/api/library/LibraryNodes';
import TreeNodeView from '/imports/client/ui/properties/treeNodeViews/TreeNodeView.vue';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import { getFilter } from '/imports/api/parenting/parentingFunctions';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{ _id: string }>();
const store = useStore(key);
const router = useRouter();

const { ready: softRemovedReady } = subscribe(() => ['softRemovedLibraryNodes', props._id]);

const { result: model } = autorun(() => Libraries.findOne(props._id));

const { result: removedDocs } = autorun(() =>
  LibraryNodes.find({
    ...getFilter.descendantsOfRoot(props._id),
    removed: true,
    removedWith: { $exists: false },
  }, { sort: { left: 1 } }).fetch()
);

const { result: isOwner } = autorun(() => {
  if (!model.value) return;
  return Meteor.userId() === model.value.owner;
});

const { result: ownerName } = autorun(() => {
  if (!model.value) return;
  return Meteor.users.findOne(model.value.owner)?.username;
});

async function updateName(value: string, ack: (error?: any) => void) {
  try {
    await updateLibraryName.callAsync({ _id: props._id, name: value });
    ack();
  } catch (error: any) {
    ack(error.reason || error);
  }
}

async function updateDescription(value: string, ack: (error?: any) => void) {
  try {
    await updateLibraryDescription.callAsync({ _id: props._id, description: value });
    ack();
  } catch (error: any) {
    ack(error.reason || error);
  }
}

async function updateShowInMarket(value: boolean, ack: (error?: any) => void) {
  try {
    await updateLibraryShowInMarket.callAsync({ _id: props._id, value });
    ack();
  } catch (error: any) {
    ack(error.reason || error);
  }
}

function remove() {
  const _id = props._id;
  store.commit('pushDialogStack', {
    component: 'delete-confirmation-dialog',
    elementId: 'delete-library-button',
    data: { name: model.value?.name, typeName: 'Library' },
    async callback(confirmation: any) {
      if (!confirmation) return;
      try {
        await removeLibrary.callAsync({ _id });
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
    data: { docRef: { id: props._id, collection: 'libraries' } },
  });
}

function restore(_id: string) {
  restoreLibraryNode.callAsync({ _id });
}
</script>

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
        v-if="!isOwner && ownerName"
        class="px-0"
        lines="two"
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
          Library owner
        </v-list-item-subtitle>
      </v-list-item>
      <text-field
        label="name"
        :value="model.name"
        @change="updateName"
      />
      <text-area
        label="Description"
        :value="model.description"
        @change="updateDescription"
      />
      <smart-switch
        :value="model.showInMarket"
        :disabled="!isOwner"
        label="Show in community library browser"
        @change="updateShowInMarket"
      />
    </template>
    <template v-if="removedDocs.length">
      <h3>Recently Deleted Properties</h3>
      <v-list>
        <v-list-item
          v-for="model in removedDocs"
          :key="model._id"
        >
          <v-list-item-title>
            <tree-node-view :model="model" />
          </v-list-item-title>
          <template #append>
            <v-btn
              color="accent"
              variant="text"
              @click="restore(model._id)"
            >
              Restore
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </template>
    <v-progress-circular
      v-if="!softRemovedReady"
      indeterminate
      color="primary"
    />
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

<style lang="css" scoped></style>
