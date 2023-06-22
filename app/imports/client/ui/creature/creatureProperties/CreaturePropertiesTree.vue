<template lang="html">
  <tree-node-list
    v-if="root"
    :children="children"
    :group="group"
    :organize="organize"
    :selected-node="selectedNode"
    :start-expanded="expanded"
    @selected="e => $emit('selected', e)"
    @reordered="reordered"
    @reorganized="reorganized"
  />
</template>

<script lang="js">
import nodesToTree from '/imports/api/parenting/nodesToTree.js'
import TreeNodeList from '/imports/client/ui/components/tree/TreeNodeList.vue';
import { organizeDoc, reorderDoc } from '/imports/api/parenting/organizeMethods.js';
import getCollectionByName from '/imports/api/parenting/getCollectionByName.js';

export default {
  components: {
    TreeNodeList,
  },
  props: {
    root: {
      type: Object,
      default: undefined,
    },
    organize: Boolean,
    selectedNode: {
      type: Object,
      default: undefined,
    },
    filter: {
      type: Object,
      default: undefined,
    },
    group: {
      type: String,
      default: 'creatureProperties'
    },
    collection: {
      type: String,
      default: 'creatureProperties'
    },
    expanded: Boolean,
  },
  meteor: {
    children() {
      const children = nodesToTree({
        collection: getCollectionByName(this.collection),
        ancestorId: this.root.id,
        filter: this.filter,
        includeFilteredDocAncestors: true,
        includeFilteredDocDescendants: true,
      });
      this.$emit('length', children.length);
      return children;
    },
  },
  methods: {
    reordered({ doc, newIndex }) {
      reorderDoc.call({
        docRef: {
          id: doc._id,
          collection: this.collection,
        },
        order: newIndex,
      });
    },
    reorganized({ doc, parent, newIndex }) {
      let parentRef;
      if (parent) {
        parentRef = {
          id: parent._id,
          collection: this.collection,
        };
      } else {
        parentRef = this.root;
      }
      organizeDoc.call({
        docRef: {
          id: doc._id,
          collection: this.collection,
        },
        parentRef,
        order: newIndex,
      });
    },
  },
};
</script>

<style lang="css" scoped>

</style>
