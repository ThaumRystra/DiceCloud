<template lang="html">
  <tree-node-list
    v-if="model && model.root"
    :children="children"
    :group="group"
    :organize="organize"
    :start-expanded="expanded"
    :root="model.root"
    @selected="e => $emit('selected', e)"
    @move-within-root="moveWithinRoot"
    @move-between-roots="moveBetweenRoots"
  />
</template>

<script lang="js">
import { docsToForest, getFilter } from '/imports/api/parenting/parentingFunctions';
import TreeNodeList from '/imports/client/ui/components/tree/TreeNodeList.vue';
import { moveBetweenRoots, moveWithinRoot } from '/imports/api/parenting/organizeMethods';
import { getCollectionByName } from '/imports/api/parenting/parentingFunctions';

export default {
  components: {
    TreeNodeList,
  },
  props: {
    // The document for which we are finding children
    model: {
      type: Object,
      default: undefined,
    },
    organize: Boolean,
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
      if (!this.model?.root) return [];
      const collection = getCollectionByName(this.collection);
      const docs = collection.find({
        removed: { $ne: true },
        ...getFilter.descendants(this.model),
      }, {
        sort: { left: 1 }
      }).fetch();
      this.$emit('length', docs.length);

      return docsToForest(docs);
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
