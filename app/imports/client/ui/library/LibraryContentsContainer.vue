<template lang="html">
  <v-fade-transition hide-on-leave>
    <tree-node-list
      v-if="slowShouldSubscribe && $subReady.libraryNodes"
      group="library"
      :children="libraryChildren"
      :organize="organizeMode"
      :selected-node="selectedNode"
      @selected="e => $emit('selected', e)"
      @reordered="reordered"
      @reorganized="reorganized"
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
import Libraries from '/imports/api/library/Libraries.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import nodesToTree from '/imports/api/parenting/nodesToTree.js';
import TreeNodeList from '/imports/client/ui/components/tree/TreeNodeList.vue';
import { organizeDoc, reorderDoc } from '/imports/api/parenting/organizeMethods.js';

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
      return nodesToTree({
        collection: LibraryNodes,
        ancestorId: this.library._id,
        filter: this.filter,
        includeFilteredDocAncestors: true,
        includeFilteredDocDescendants: true,
      });
    },
  },
  methods: {
    reordered({ doc, newIndex }) {
      reorderDoc.call({
        docRef: {
          id: doc._id,
          collection: 'libraryNodes',
        },
        order: newIndex,
      });
    },
    reorganized({ doc, parent, newIndex }) {
      let parentRef;
      if (parent) {
        parentRef = {
          id: parent._id,
          collection: 'libraryNodes',
        };
      } else {
        parentRef = {
          id: this.libraryId,
          collection: 'libraries',
        };
      }
      organizeDoc.call({
        docRef: {
          id: doc._id,
          collection: 'libraryNodes',
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
