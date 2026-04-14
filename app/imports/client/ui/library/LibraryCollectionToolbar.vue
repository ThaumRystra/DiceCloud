<template lang="html">
  <v-app-bar
    color="secondary"
    theme="dark"
    density="compact"
  >
    <v-app-bar-nav-icon @click="toggleDrawer" />
    <v-btn
      icon="mdi-arrow-left"
      @click="back"
    />
    <v-toolbar-title>
      {{ libraryCollection && libraryCollection.name }}
    </v-toolbar-title>
    <v-spacer />
    <v-btn
      v-if="showSubscribeButton"
      variant="text"
      :loading="loading"
      @click="subscribe(!subscribed)"
    >
      {{ subscribed ? 'Unsubscribe' : 'Subscribe' }}
    </v-btn>
    <v-btn
      v-if="canEdit"
      icon="mdi-cog"
      data-id="library-collection-edit-button"
      @click="editLibraryCollection"
    />
    <template #extension>
      <v-spacer />
      <div
        v-if="libraryCollection && libraryCollection.subscriberCount"
        class="mx-4 text-disabled"
      >
        {{ formatNumber(libraryCollection.subscriberCount) }} subscribers
      </div>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { autorun } from 'vue-meteor-tracker';
import { Meteor } from 'meteor/meteor';
import LibraryCollections from '/imports/api/library/LibraryCollections';
import { assertDocEditPermission } from '/imports/api/sharing/sharingPermissions';
import formatter from '/imports/client/ui/utility/numberFormatter';
import { key } from '/imports/client/ui/vuexStore';

const store = useStore(key);
const router = useRouter();
const route = useRoute();
const loading = ref(false);

const { result: libraryCollection } = autorun(() =>
  LibraryCollections.findOne(route.params.id as string)
);

const { result: subscribed } = autorun(() => {
  const libraryCollectionId = route.params.id as string;
  const user = Meteor.user();
  return user?.subscribedLibraryCollections?.includes(libraryCollectionId);
});

const { result: showSubscribeButton } = autorun(() => {
  const user = Meteor.user();
  const lc = libraryCollection.value;
  if (!user || !lc) return;
  const userId = user._id;
  if (user.subscribedLibraryCollections?.includes(lc._id)) return true;
  if (lc.readers.includes(userId) || lc.writers.includes(userId) || lc.owner === userId) return false;
  return true;
});

const { result: canEdit } = autorun(() => {
  try {
    assertDocEditPermission(libraryCollection.value, Meteor.userId());
    return true;
  } catch (e) {
    return false;
  }
});

function formatNumber(num: number) {
  return formatter.format(num);
}

async function subscribe(value: boolean) {
  loading.value = true;
  try {
    await (Meteor as any).users.subscribeToLibraryCollection.callAsync({
      libraryCollectionId: route.params.id,
      subscribe: value,
    });
  } finally {
    loading.value = false;
  }
}

function editLibraryCollection() {
  store.commit('pushDialogStack', {
    component: 'library-collection-edit-dialog',
    elementId: 'library-collection-edit-button',
    data: { _id: route.params.id },
  });
}

function back() {
  return window.history.length > 2 ? router.back() : router.push('/library');
}

function toggleDrawer() {
  store.commit('toggleDrawer');
}
</script>

<style lang="css" scoped></style>
