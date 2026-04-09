<template lang="html">
  <v-btn
    :fab="fab"
    :outlined="!fab"
    size="small"
    color="primary"
    data-id="insert-library-node-button"
    @click="insertLibraryNode"
  >
    <v-icon>mdi-plus</v-icon>
    <slot />
  </v-btn>
</template>

<script setup lang="ts">
import { useStore } from 'vuex';
import { Meteor } from 'meteor/meteor';
import { insertNode } from '/imports/api/library/LibraryNodes';
import { getUserTier } from '/imports/api/users/patreon/tiers';

const props = defineProps<{
  libraryId: string;
  selectedNodeId?: string;
  fab?: boolean;
}>();

const emit = defineEmits<{ (e: 'selected', id: string): void }>();
const store = useStore();

function insertLibraryNode() {
  const libraryId = props.libraryId;
  const tier = getUserTier(Meteor.userId());
  if (!(tier && tier.paidBenefits)) {
    store.commit('pushDialogStack', {
      component: 'tier-too-low-dialog',
      elementId: 'insert-library-node-button',
    });
    return;
  }
  const parentRef = { id: libraryId, collection: 'libraries' };
  store.commit('pushDialogStack', {
    component: 'insert-property-dialog',
    elementId: 'insert-library-node-button',
    data: {
      hideLibraryTab: true,
      noBackdropClose: true,
      showLibraryOnlyProps: true,
      collection: 'libraryNodes',
    },
    async callback(libraryNode: any) {
      if (!libraryNode) return;
      libraryNode.order = -1;
      const libraryNodeId = await insertNode.callAsync({ libraryNode, parentRef });
      emit('selected', libraryNodeId);
      return `tree-node-${libraryNodeId}`;
    },
  });
}
</script>

<style lang="css" scoped>
</style>

</script>

<style lang="css" scoped>
</style>
