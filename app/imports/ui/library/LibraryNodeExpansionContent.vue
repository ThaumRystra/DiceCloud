<template lang="html">
  <div>
    <component
      :is="model.type"
      :model="model"
      class="property-viewer"
    />
    <tree-node-list
      v-if="$subReady.descendantLibraryNodes"
      group="library-node-expansion"
      :children="propertyChildren"
      @selected="clickChild"
    />
  </div>
</template>

<script lang="js">
import nodesToTree from '/imports/api/parenting/nodesToTree.js'
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import propertyViewerIndex from '/imports/ui/properties/viewers/shared/propertyViewerIndex.js';
import TreeNodeList from '/imports/ui/components/tree/TreeNodeList.vue';

export default {
  components: {
    TreeNodeList,
    ...propertyViewerIndex,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  methods: {
    clickChild(id){
      this.$store.commit('pushDialogStack', {
        component: 'library-node-dialog',
        elementId: `tree-node-${id}`,
        data: {
          _id: id,
        },
      });
    },
  },
  meteor: {
    $subscribe: {
      libraryNode(){
        return [this.model._id];
      },
      descendantLibraryNodes(){
        return [this.model._id];
      },
    },
    propertyChildren(){
      return nodesToTree({
        collection: LibraryNodes,
        ancestorId: this.model._id
      });
    },
  },
}
</script>

<style lang="css" scoped>
</style>
