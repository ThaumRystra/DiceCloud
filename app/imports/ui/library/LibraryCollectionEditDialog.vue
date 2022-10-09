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
        @click="share"
      >
        <v-icon>mdi-share-variant</v-icon>
      </v-btn>
      <v-btn
        icon
        data-id="delete-library-button"
        @click="remove"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </template>
    <template v-if="model">
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
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import LibraryCollections, { updateLibraryCollection, removeLibraryCollection } from '/imports/api/library/LibraryCollections.js';
import { snackbar } from '/imports/ui/components/snackbars/SnackbarQueue.js';
import Libraries from '/imports/api/library/Libraries.js';

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
  }
}
</script>

<style lang="css" scoped>

</style>
