<template lang="html">
  <v-btn
    fab
    small
    color="primary"
    data-id="insert-library-node-button"
    @click="insertLibraryNode"
  >
    <v-icon>add</v-icon>
  </v-btn>
</template>

<script lang="js">
import { getAncestry } from  '/imports/api/parenting/parenting.js';
import { setDocToLastOrder } from '/imports/api/parenting/order.js';
import LibraryNodes, { insertNode } from '/imports/api/library/LibraryNodes.js';
import { getUserTier } from '/imports/api/users/patreon/tiers.js';

export default {
  props: {
    libraryId: {
      type: String,
      required: true,
    },
    parentId: {
      type: String,
      default: undefined,
    },
    parentCollection: {
      type: String,
      default: undefined,
    },
  },
  methods: {
    insertLibraryNode(){
      let libraryId = this.libraryId;
      let tier = getUserTier(Meteor.userId())
      if (tier && tier.paidBenefits){
        let parentRef = {
          id: this.parentId || libraryId,
          collection: this.parentCollection || 'libraries',
        };
        let {ancestors} = getAncestry({parentRef});
        this.$store.commit('pushDialogStack', {
          component: 'library-node-creation-dialog',
          elementId: 'insert-library-node-button',
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
          elementId: 'insert-library-node-button',
        });
      }
    },
  }
}
</script>

<style lang="css" scoped>
</style>
