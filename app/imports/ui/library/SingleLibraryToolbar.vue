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
    <v-btn
      icon
      @click="$router.push('/library')"
    >
      <v-icon>arrow_back</v-icon>
    </v-btn>
    <v-toolbar-title>
      {{ library && library.name }}
    </v-toolbar-title>
    <v-spacer />
    <v-btn
      v-if="showSubscribeButton"
      text
      :loading="loading"
      @click="subscribe(!subscribed)"
    >
      {{ subscribed ? 'Unsubscribe' : 'Subscribe' }}
    </v-btn>
    <v-btn
      v-if="canEdit"
      icon
      data-id="library-edit-button"
      @click="editLibrary(library._id)"
    >
      <v-icon>settings</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script lang="js">
import Libraries from '/imports/api/library/Libraries.js';
import { assertDocEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import { mapMutations } from 'vuex';

export default {
  data(){ return {
    loading: false,
  }},
  meteor: {
    library(){
      return Libraries.findOne(this.$route.params.id);
    },
    subscribed(){
      let libraryId = this.$route.params.id;
      let user = Meteor.user();
      if (!user) return false;
      let subs = user.subscribedLibraries;
      return subs && subs.includes(libraryId);
    },
    showSubscribeButton(){
      let userId = Meteor.userId();
      let library = this.library;
      if (!library) return;
      if (
        library.readers.includes(userId) ||
        library.writers.includes(userId) ||
        library.owner === userId
      ) {
        return false
      } else {
        return true;
      }
    },
    canEdit(){
      try {
        assertDocEditPermission(this.library, Meteor.userId());
        return true
      } catch (e) {
        return false;
      }
    }
  },
  methods: {
    ...mapMutations([
      'toggleDrawer',
    ]),
    subscribe(value){
      this.loading = true;
      Meteor.users.subscribeToLibrary.call({
        libraryId: this.$route.params.id,
        subscribe: value,
      }, () => {
        this.loading = false;
      });
    },
    editLibrary(){
			this.$store.commit('pushDialogStack', {
				component: 'library-edit-dialog',
				elementId: 'library-edit-button',
				data: {_id: this.$route.params.id},
			});
		},
  },
}
</script>

<style lang="css" scoped>
</style>
