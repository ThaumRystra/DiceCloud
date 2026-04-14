<script setup lang="ts">
import { autorun } from 'vue-meteor-tracker';
import { useStore } from 'vuex';
import { Session } from 'meteor/session';
import { key } from '/imports/client/ui/vuexStore';

const store = useStore(key);

const { result: editing } = autorun(() => Session.get('editingDocs'));
const { result: canEdit } = autorun(() => {
  const user = Meteor.user();
  if (!user) return false;
  return user.roles?.includes('docsWriter');
});

function toggleDrawer() {
  store.commit('toggleDrawer');
}

function toggleRightDrawer() {
  store.commit('toggleRightDrawer');
}

function toggleEdit() {
  if (!canEdit.value) return;
  Session.set('editingDocs', !Session.get('editingDocs'));
}
</script>

<template lang="html">
  <v-app-bar
    color="secondary"
    theme="dark"
    density="compact"
  >
    <v-app-bar-nav-icon @click="toggleDrawer" />
    <v-toolbar-title>
      Documentation
    </v-toolbar-title>
    <v-spacer />
    <v-app-bar-nav-icon
      v-if="editing"
      @click="toggleRightDrawer"
    >
      <v-icon>mdi-file-tree</v-icon>
    </v-app-bar-nav-icon>
    <v-btn
      v-if="canEdit"
      :icon="editing ? 'mdi-check' : 'mdi-pencil'"
      @click="toggleEdit"
    />
  </v-app-bar>
</template>
