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
        v-if="!isOwner && ownerName"
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
            {{ ownerName }}
          </v-list-item-title>
          <v-list-item-subtitle>
            Library owner
          </v-list-item-subtitle>
        </v-list-item-content>
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
          <v-list-item-content>
            <v-list-item-title>
              <tree-node-view :model="model" />
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn
              color="accent"
              text
              @click="restore(model._id)"
            >
              Restore
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </template>
    <v-progress-circular
      v-if="!$subReady.softRemovedLibraryNodes"
      indeterminate
      color="primary"
    />
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
import Libraries, { updateLibraryName, updateLibraryDescription, updateLibraryShowInMarket, removeLibrary } from '/imports/api/library/Libraries.js';
import LibraryNodes, { restoreLibraryNode } from '/imports/api/library/LibraryNodes.js';
import TreeNodeView from '/imports/client/ui/properties/treeNodeViews/TreeNodeView.vue';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue.js';

export default {
  components: {
    DialogBase,
    TreeNodeView,
  },
  props: {
    _id: String,
  },
  methods: {
    updateName(value, ack) {
      updateLibraryName.call({ _id: this._id, name: value }, (error) => {
        ack(error && error.reason || error);
      });
    },
    updateDescription(value, ack) {
      updateLibraryDescription.call({ _id: this._id, description: value }, (error) => {
        ack(error && error.reason || error);
      });
    },
    updateShowInMarket(value, ack) {
      updateLibraryShowInMarket.call({ _id: this._id, value }, (error) => {
        ack(error && error.reason || error);
      });
    },
    remove() {
      const _id = this._id;
      const $router = this.$router;
      const $store = this.$store;
      this.$store.commit('pushDialogStack', {
        component: 'delete-confirmation-dialog',
        elementId: 'delete-library-button',
        data: {
          name: this.model.name,
          typeName: 'Library'
        },
        callback(confirmation) {
          if (!confirmation) return;
          removeLibrary.call({ _id }, (error) => {
            if (error) {
              console.error(error);
              snackbar({
                text: error.reason,
              });
            } else {
              $router.push({ name: 'library', replace: true });
              $store.dispatch('popDialogStack');
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
            collection: 'libraries',
          }
        },
      });
    },
    restore(_id) {
      restoreLibraryNode.call({ _id });
    },
  },
  meteor: {
    '$subscribe': {
      softRemovedLibraryNodes() {
        return [this._id];
      },
    },
    model() {
      return Libraries.findOne(this._id);
    },
    removedDocs() {
      return LibraryNodes.find({
        'ancestors.0.id': this._id,
        removed: true,
        removedWith: { $exists: false },
      }, {
        sort: { order: 1 },
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
