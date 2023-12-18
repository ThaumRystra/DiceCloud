<template lang="html">
  <v-app-bar
    app
    color="secondary"
    dark
    :extended="$vuetify.breakpoint.smAndUp"
    :tabs="$vuetify.breakpoint.smAndUp"
    dense
  >
    <v-app-bar-nav-icon @click="toggleDrawer" />
    <v-btn
      icon
      @click="back"
    >
      <v-icon>mdi-arrow-left</v-icon>
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
      <v-icon>mdi-cog</v-icon>
    </v-btn>
    <v-spacer slot="extension" />
    <div
      v-if="library && library.subscriberCount"
      slot="extension"
      class="mx-4 text--disabled"
    >
      {{ formatNumber(library.subscriberCount) }} subscribers
    </div>
  </v-app-bar>
</template>

<script lang="js">
import Libraries from '/imports/api/library/Libraries';
import formatter from '/imports/client/ui/utility/numberFormatter';
import { assertDocEditPermission } from '/imports/api/sharing/sharingPermissions';
import { mapMutations } from 'vuex';

export default {
  data() {
    return {
      loading: false,
    }
  },
  meteor: {
    library() {
      return Libraries.findOne(this.$route.params.id);
    },
    subscribed() {
      let libraryId = this.$route.params.id;
      let user = Meteor.user();
      return user?.subscribedLibraries?.includes(libraryId);
    },
    showSubscribeButton() {
      let user = Meteor.user();
      let library = this.library;
      if (!user || !library) return;
      let userId = user._id;
      if (user.subscribedLibraries.includes(library._id)) {
        return true
      } else if (
        library.readers.includes(userId) ||
        library.writers.includes(userId) ||
        library.owner === userId
      ) {
        return false
      } else {
        return true;
      }
    },
    canEdit() {
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
    formatNumber(num) {
      return formatter.format(num);
    },
    subscribe(value) {
      this.loading = true;
      Meteor.users.subscribeToLibrary.call({
        libraryId: this.$route.params.id,
        subscribe: value,
      }, () => {
        this.loading = false;
      });
    },
    editLibrary() {
      this.$store.commit('pushDialogStack', {
        component: 'library-edit-dialog',
        elementId: 'library-edit-button',
        data: { _id: this.$route.params.id },
      });
    },
    back() {
      return window.history.length > 2 ? this.$router.back() : this.$router.push('/library');
    },
  },
}
</script>

<style lang="css" scoped>

</style>
