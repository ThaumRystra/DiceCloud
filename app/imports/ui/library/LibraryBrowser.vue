<template lang="html">
  <div
    style="
      background-color: inherit;
      overflow-y: auto;
    "
  >
    <v-expansion-panel
      v-model="expandedLibrary"
      style="box-shadow: none;"
    >
      <v-expansion-panel-content
        v-for="library in libraries"
        :key="library._id"
        lazy
        :data-id="library._id"
      >
        <template #header>
          <div class="title">
            {{ library.name }}
          </div>
        </template>
        <v-card flat>
          <library-contents-container
            :library-id="library._id"
            :organize-mode="organizeMode"
            :edit-mode="editMode"
            :selected-node-id="selectedNodeId"
            @selected="e => $emit('selected', e)"
          />
          <v-card-actions>
            <v-btn
              flat
              small
              style="background-color: inherit; margin-top: 0;"
              :disabled="!editPermission(library)"
              :data-id="`insert-node-${library._id}`"
              @click="insertLibraryNode(library._id)"
            >
              <v-icon>add</v-icon>
              New property
            </v-btn>
            <v-spacer />
            <v-btn
              flat
              small
              icon
              :disabled="!editPermission(library)"
              @click="editLibrary(library._id)"
            >
              <v-icon>create</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-expansion-panel-content>
    </v-expansion-panel>
    <v-btn
      v-show="expandedLibrary === null"
      v-if="editMode"
      flat
      color="primary"
      style="background-color: inherit;"
      data-id="insert-library-button"
      @click="insertLibrary"
    >
      <v-icon>add</v-icon>
      New library
    </v-btn>
  </div>
</template>

<script>
import LibraryContentsContainer from '/imports/ui/library/LibraryContentsContainer.vue';
import { setDocToLastOrder } from '/imports/api/parenting/order.js';
import LibraryNodes, { insertNode } from '/imports/api/library/LibraryNodes.js';
import Libraries, { insertLibrary } from '/imports/api/library/Libraries.js';
import { getUserTier } from '/imports/api/users/patreon/tiers.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import { getAncestry } from  '/imports/api/parenting/parenting.js';

export default {
  components: {
    LibraryContentsContainer,
  },
  props: {
    organizeMode: Boolean,
    editMode: Boolean,
    selectedNodeId: String,
  },
  data(){ return {
    expandedLibrary: null,
  };},
  meteor: {
    $subscribe: {
      'libraries': [],
    },
    libraries(){
      return Libraries.find({}, {
        sort: {name: 1}
      }).fetch();
    },
    paidBenefits(){
      let tier = getUserTier(Meteor.userId());
      return tier && tier.paidBenefits;
    },
  },
  methods: {
    insertLibrary(){
      if (this.paidBenefits){
        this.$store.commit('pushDialogStack', {
          component: 'library-creation-dialog',
          elementId: 'insert-library-button',
          callback(library){
            if (!library) return;
            let libraryId = insertLibrary.call(library);
            return libraryId;
          }
        });
      } else {
        this.$store.commit('pushDialogStack', {
          component: 'tier-too-low-dialog',
          elementId: 'insert-library-button',
        });
      }
    },
    editPermission(library){
      try {
        assertEditPermission(library, Meteor.userId());
        return true;
      } catch (e) {
        return false;
      }
    },
    editLibrary(_id){
      this.$store.commit('pushDialogStack', {
        component: 'library-edit-dialog',
        elementId: _id,
        data: {_id},
      });
    },
    insertLibraryNode(libraryId){
      if (this.paidBenefits){
        let parentRef;
        if (this.organizeMode && this.selectedNodeId){
          parentRef = {collection: 'libraryNodes', id: this.selectedNodeId}
        } else {
          parentRef = {collection: 'libraries', id: libraryId};
        }
        let {ancestors} = getAncestry({parentRef});
        this.$store.commit('pushDialogStack', {
          component: 'library-node-creation-dialog',
          elementId: `insert-node-${libraryId}`,
          callback(libraryNode){
            if (!libraryNode) return;
            libraryNode.parent = parentRef;
            libraryNode.ancestors = ancestors;
            setDocToLastOrder({collection: LibraryNodes, doc: libraryNode});
            let libraryNodeId = insertNode.call(libraryNode);
            return `tree-node-${libraryNodeId}`;
          }
        });
      } else {
        this.$store.commit('pushDialogStack', {
          component: 'tier-too-low-dialog',
          elementId: `insert-node-${libraryId}`,
        });
      }
    },
  },
}
</script>

<style lang="css" scoped>
</style>
