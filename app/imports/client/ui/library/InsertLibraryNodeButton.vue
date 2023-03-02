<template>
  <v-btn
    :fab="fab"
    :outlined="!fab"
    small
    color="primary"
    data-id="insert-library-node-button"
    @click="insertLibraryNode"
  >
    <v-icon>mdi-plus</v-icon>
    <slot />
  </v-btn>
</template>

<script>
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
    selectedNodeId: {
      type: String,
      default: undefined,
    },
    fab: Boolean,
  },
  methods: {
    insertLibraryNode(){
      let libraryId = this.libraryId;

      // Check tier has paid benefits
      let tier = getUserTier(Meteor.userId());
      if (!(tier && tier.paidBenefits)){
        this.$store.commit('pushDialogStack', {
          component: 'tier-too-low-dialog',
          elementId: 'insert-library-node-button',
        });
        return;
      }

      // Get ancestry reference
      let order, parentRef;
      let selectedComponent = document.querySelector(
        `[data-id="tree-node-${this.selectedNodeId}"]`
      );
      if (selectedComponent){
        let vueInstance = selectedComponent.__vue__.$parent;
        if (vueInstance.showExpanded){
          parentRef = {
            id: this.selectedNodeId,
            collection: 'libraryNodes',
          };
        } else {
          parentRef = vueInstance.node.parent;
          order = vueInstance.node.order + 0.5;
        }
      } else {
        parentRef = {
          id: libraryId,
          collection: 'libraries',
        };
      }
      let {ancestors} = getAncestry({parentRef});

      // Insert form dialog
      let that = this;
      this.$store.commit('pushDialogStack', {
        component: 'library-node-creation-dialog',
        elementId: 'insert-library-node-button',
        callback(libraryNode){
          if (!libraryNode) return;

          // Set ancestry and order
          libraryNode.parent = parentRef;
          libraryNode.ancestors = ancestors;
          if (order){
            libraryNode.order = order;
          } else {
            setDocToLastOrder({collection: LibraryNodes, doc: libraryNode});
          }

          // Insert doc
          let libraryNodeId = insertNode.call(libraryNode);
          that.$emit('selected', libraryNodeId);
          return `tree-node-${libraryNodeId}`;
        }
      });
    },
  }
}
</script>

<style lang="css" scoped>
</style>
