<template lang="html">
  <tree-node-list
    v-if="root"
    :children="children"
    :group="group"
    :organize="organize"
    :selected-node="selectedNode"
    :start-expanded="expanded"
    :root="root"
    @selected="e => $emit('selected', e)"
    @move-within-root="moveWithinRoot"
    @move-between-roots="moveBetweenRoots"
  />
</template>

<script lang="js">
import { filterToForest } from '/imports/api/parenting/parentingFunctions';
import TreeNodeList from '/imports/client/ui/components/tree/TreeNodeList.vue';
import { moveBetweenRoots, moveWithinRoot } from '/imports/api/parenting/organizeMethods';
import { getCollectionByName } from '/imports/api/parenting/parentingFunctions';

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
      const children = filterToForest?.(
        getCollectionByName(this.collection),
        this.root.id,
        this.filter,
        {
          includeFilteredDocAncestors: true,
          includeFilteredDocDescendants: true,
        }
      ) || [];
      this.$emit('length', children.length);
      return children;
    },
  },
  methods: {
    moveWithinRoot({ doc, newPosition }) {
      moveWithinRoot.callAsync({
        docRef: {
          id: doc._id,
          collection: this.collection,
        },
        newPosition,
      });
    },
    moveBetweenRoots({ doc, newPosition, newRootRef }) {
      moveBetweenRoots.callAsync({
        docRef: {
          id: doc._id,
          collection: this.collection,
        },
        newPosition,
        newRootRef,
      });
    },
  },
};
</script>

<style lang="css" scoped>

</style>
