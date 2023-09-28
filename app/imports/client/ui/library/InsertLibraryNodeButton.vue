<template lang="html">
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

<script lang="js">
import { insertNode } from '/imports/api/library/LibraryNodes';
import { getUserTier } from '/imports/api/users/patreon/tiers';

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
      const parentRef = {
        id: libraryId,
        collection: 'libraries',
      };

      // Insert form dialog
      const that = this;
      this.$store.commit('pushDialogStack', {
        component: 'insert-property-dialog',
        elementId: 'insert-library-node-button',
        data: {
          hideLibraryTab: true,
          noBackdropClose: true,
          showLibraryOnlyProps: true,
          collection: 'libraryNodes',
        },
        callback(libraryNode){
          if (!libraryNode) return;

          // Set order to first
          libraryNode.order = -1;

          // Insert doc
          let libraryNodeId = insertNode.call({ libraryNode, parentRef });
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
