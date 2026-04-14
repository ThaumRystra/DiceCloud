<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { autorun } from 'vue-meteor-tracker';
import { Meteor } from 'meteor/meteor';
import Libraries from '/imports/api/library/Libraries';
import formatter from '/imports/client/ui/utility/numberFormatter';
import { assertDocEditPermission } from '/imports/api/sharing/sharingPermissions';
import { key } from '/imports/client/ui/vuexStore';

const store = useStore(key);
const router = useRouter();
const route = useRoute();
const loading = ref(false);

const { result: library } = autorun(() =>
  Libraries.findOne(route.params.id as string)
);

const { result: subscribed } = autorun(() => {
  const libraryId = route.params.id as string;
  const user = Meteor.user();
  return user?.subscribedLibraries?.includes(libraryId);
});

const { result: showSubscribeButton } = autorun(() => {
  const user = Meteor.user();
  const lib = library.value;
  if (!user || !lib) return;
  const userId = user._id;
  if (user.subscribedLibraries.includes(lib._id)) return true;
  if (lib.readers.includes(userId) || lib.writers.includes(userId) || lib.owner === userId) return false;
  return true;
});

const { result: canEdit } = autorun(() => {
  try {
    assertDocEditPermission(library.value, Meteor.userId());
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
    await (Meteor as any).users.subscribeToLibrary.callAsync({
      libraryId: route.params.id,
      subscribe: value,
    });
  } finally {
    loading.value = false;
  }
}

function editLibrary() {
  store.commit('pushDialogStack', {
    component: 'library-edit-dialog',
    elementId: 'library-edit-button',
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
      {{ library && library.name }}
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
      data-id="library-edit-button"
      @click="editLibrary(library._id)"
    />
    <template #extension>
      <v-spacer />
      <div
        v-if="library && library.subscriberCount"
        class="mx-4 text-disabled"
      >
        {{ formatNumber(library.subscriberCount) }} subscribers
      </div>
    </template>
  </v-app-bar>
</template>

<style lang="css" scoped></style>
