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
      @click="back"
    >
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>
    <v-toolbar-title>
      {{ libraryCollection && libraryCollection.name }}
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
      data-id="library-collection-edit-button"
      @click="editLibraryCollection"
    >
      <v-icon>mdi-cog</v-icon>
    </v-btn>
    <v-spacer slot="extension" />
    <div
      v-if="libraryCollection && libraryCollection.subscriberCount"
      slot="extension"
      class="mx-4 text--disabled"
    >
      {{ formatNumber(libraryCollection.subscriberCount) }} subscribers
    </div>
  </v-app-bar>
</template>

<script lang="js">
import LibraryCollections from '/imports/api/library/LibraryCollections';
import { assertDocEditPermission } from '/imports/api/sharing/sharingPermissions';
import { mapMutations } from 'vuex';
import formatter from '/imports/client/ui/utility/numberFormatter';

export default {
  data() {
    return {
      loading: false,
    }
  },
  meteor: {
    libraryCollection() {
      return LibraryCollections.findOne(this.$route.params.id);
    },
    subscribed() {
      const libraryCollectionId = this.$route.params.id;
      const user = Meteor.user();
      return user?.subscribedLibraryCollections?.includes(libraryCollectionId);
    },
    showSubscribeButton() {
      let user = Meteor.user();
      let libraryCollection = this.libraryCollection;
      if (!user || !libraryCollection) return;
      let userId = user._id;
      if (user.subscribedLibraryCollections?.includes(libraryCollection._id)) {
        return true
      } else if (
        libraryCollection.readers.includes(userId) ||
        libraryCollection.writers.includes(userId) ||
        libraryCollection.owner === userId
      ) {
        return false
      } else {
        return true;
      }
    },
    canEdit() {
      try {
        assertDocEditPermission(this.libraryCollection, Meteor.userId());
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
      Meteor.users.subscribeToLibraryCollection.call({
        libraryCollectionId: this.$route.params.id,
        subscribe: value,
      }, () => {
        this.loading = false;
      });
    },
    editLibraryCollection() {
      this.$store.commit('pushDialogStack', {
        component: 'library-collection-edit-dialog',
        elementId: 'library-collection-edit-button',
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
