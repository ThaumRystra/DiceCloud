<template lang="html">
  <v-app-bar
    app
    color="secondary"
    dark
    tabs
    extended
    dense
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
      icon
      @click="toggleEdit"
    >
      <v-icon v-if="editing">
        mdi-check
      </v-icon>
      <v-icon v-else>
        mdi-pencil
      </v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script lang="js">
import { mapMutations } from 'vuex';
import { Session } from 'meteor/session';

export default {
  meteor: {
    editing() {
      return Session.get('editingDocs');
    },
    canEdit() {
      const user = Meteor.user();
      if (!user) return false;
      return user.roles?.includes('docsWriter');
    }
  },
  methods: {
    ...mapMutations([
      'toggleDrawer',
      'toggleRightDrawer',
    ]),
    toggleEdit() {
      if (!this.canEdit) return;
      Session.set('editingDocs', !Session.get('editingDocs'));
    },
  },
}
</script>
