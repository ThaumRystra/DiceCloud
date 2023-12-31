<template lang="html">
  <v-fade-transition hide-on-leave>
    <tree-node-list
      v-if="slowShouldSubscribe && $subReady.libraryNodes"
      group="library"
      :children="libraryChildren"
      :organize="organizeMode"
      :selected-node="selectedNode"
      :root="{collection: 'libraries', id: libraryId}"
      @selected="e => $emit('selected', e)"
      @move-within-root="moveWithinRoot"
      @move-between-roots="moveBetweenRoots"
    />
    <v-layout
      v-else
      align-center
      justify-center
      style="width: 100%;"
    >
      <v-progress-circular
        color="primary"
        :indeterminate="slowShouldSubscribe"
      />
    </v-layout>
  </v-fade-transition>
</template>

<script lang="js">
import Libraries from '/imports/api/library/Libraries';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import { filterToForest } from '/imports/api/parenting/parentingFunctions';
import TreeNodeList from '/imports/client/ui/components/tree/TreeNodeList.vue';
import { moveBetweenRoots, moveWithinRoot } from '/imports/api/parenting/organizeMethods';

export default {
  components: {
    TreeNodeList,
  },
  props: {
    libraryId: {
      type: String,
      default: undefined,
    },
    organizeMode: Boolean,
    selectedNode: {
      type: Object,
      default: undefined,
    },
    shouldSubscribe: Boolean,
    filter: {
      type: Object,
      default: undefined,
    },
    extraFields: {
      type: Array,
      default: undefined,
    },
  },
  data() {
    return {
      slowShouldSubscribe: this.shouldSubscribe,
    };
  },
  watch: {
    shouldSubscribe(newValue) {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        delete this.timeoutId;
      }
      if (newValue) {
        this.slowShouldSubscribe = newValue
      } else {
        this.timeoutId = setTimeout(() => {
          this.slowShouldSubscribe = newValue
        }, 2000);
      }
    }
  },
  meteor: {
    $subscribe: {
      'libraryNodes'() {
        if (this.slowShouldSubscribe) {
          return [this.libraryId, this.extraFields];
        } else {
          return [];
        }
      }
    },
    library() {
      return Libraries.findOne(this.libraryId);
    },
    libraryChildren() {
      if (!this.library) return;
      return filterToForest(
        LibraryNodes,
        this.libraryId,
        this.filter,
        {
          includeFilteredDocAncestors: true,
          includeFilteredDocDescendants: true,
        }
      );
    },
  },
  methods: {
    moveWithinRoot({ doc, newPosition }) {
      moveWithinRoot.callAsync({
        docRef: {
          id: doc._id,
          collection: 'libraryNodes',
        },
        newPosition,
      });
    },
    moveBetweenRoots({ doc, newPosition, newRootRef }) {
      moveBetweenRoots.callAsync({
        docRef: {
          id: doc._id,
          collection: 'libraryNodes',
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
