<template lang="html">
  <dialog-base>
    <template slot="toolbar">
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
        two-line
      >
        <v-list-item-avatar>
          <v-icon>
            mdi-account
          </v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>
            {{ ownerName || '?' }}
          </v-list-item-title>
          <v-list-item-subtitle>
            Collection owner
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <text-field
        label="name"
        :value="model.name"
        @change="(name, ack) => updateLibraryCollection({name}, ack)"
      />
      <text-area
        label="Description"
        :value="model.description"
        @change="(description, ack) => updateLibraryCollection({description}, ack)"
      />
      <smart-switch
        :value="model.showInMarket"
        :disabled="!isOwner"
        label="Show in community library browser"
        @change="(showInMarket, ack) => updateLibraryCollection({showInMarket}, ack)"
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
        @change="(libraries, ack) => updateLibraryCollection({libraries}, ack)"
      />
    </template>
    <template slot="actions">
      <v-spacer />
      <v-btn
        text
        data-id="delete-library-button"
        @click="$store.dispatch('popDialogStack')"
      >
        Done
      </v-btn>
    </template>
  </dialog-base>
</template>

<script lang="js">
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import LibraryCollections, { updateLibraryCollection, removeLibraryCollection } from '/imports/api/library/LibraryCollections';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import Libraries from '/imports/api/library/Libraries';

export default {
  components: {
    DialogBase,
  },
  props: {
    _id: String,
  },
  methods: {
    updateLibraryCollection(update, ack) {
      updateLibraryCollection.call({ _id: this._id, update }, (error) => {
        ack(error && error.reason || error);
      });
    },
    remove() {
      let that = this;
      this.$store.commit('pushDialogStack', {
        component: 'delete-confirmation-dialog',
        elementId: 'delete-library-button',
        data: {
          name: this.model.name,
          typeName: 'Collection'
        },
        callback(confirmation) {
          if (!confirmation) return;
          removeLibraryCollection.call({ _id: that._id }, (error) => {
            if (error) {
              console.error(error);
              snackbar({
                text: error.reason,
              });
            } else {
              that.$router.push({ name: 'library', replace: true });
              that.$store.dispatch('popDialogStack');
            }
          });
        }
      });
    },
    share() {
      this.$store.commit('pushDialogStack', {
        component: 'share-dialog',
        elementId: 'share-library-button',
        data: {
          docRef: {
            id: this._id,
            collection: 'libraryCollections',
          }
        },
      });
    },
  },
  meteor: {
    '$subscribe': {
      libraries: [],
      libraryCollection() {
        return [this._id]
      },
    },
    model() {
      return LibraryCollections.findOne(this._id);
    },
    libraryOptions() {
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
      ).map(library => {
        return {
          text: library.name,
          value: library._id,
        };
      });
    },
    isOwner() {
      if (!this.model) return;
      return Meteor.userId() === this.model.owner;
    },
    ownerName() {
      if (!this.model) return;
      const username = Meteor.users.findOne(this.model.owner)?.username;
      return username;
    },
  }
}
</script>

<style lang="css" scoped>

</style>
