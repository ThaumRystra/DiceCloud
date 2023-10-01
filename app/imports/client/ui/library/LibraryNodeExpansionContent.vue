<template lang="html">
  <div :key="id">
    <v-progress-linear
      v-if="!subsReady"
      indeterminate
      color="accent"
    />
    <v-expand-transition>
      <div
        v-if="subsReady"
        class="pt-4"
      >
        <component
          :is="model.type"
          :model="model"
          class="property-viewer"
        />
        <tree-node-list
          group="library-node-expansion"
          :children="propertyChildren"
          @selected="clickChild"
        />
      </div>
    </v-expand-transition>
  </div>
</template>

<script lang="js">
import { filterToForest } from '/imports/api/parenting/parentingFunctions';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import propertyViewerIndex from '/imports/client/ui/properties/viewers/shared/propertyViewerIndex';
import TreeNodeList from '/imports/client/ui/components/tree/TreeNodeList.vue';

export default {
  components: {
    TreeNodeList,
    ...propertyViewerIndex,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  computed: {
    subsReady() {
      return this.$subReady.descendantLibraryNodes && this.$subReady.libraryNode;
    }
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
        return [this.id];
      },
      descendantLibraryNodes(){
        return [this.id];
      },
    },
    model() {
      return LibraryNodes.findOne(this.id);
    },
    propertyChildren() {
      return filterToForest(LibraryNodes, this.id, {});
    },
  }
}
</script>

<style lang="css" scoped>
</style>
