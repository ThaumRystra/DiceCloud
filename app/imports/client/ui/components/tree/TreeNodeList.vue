<template lang="html">
  <!--use value for immutable, list for auto-updating children -->
  <draggable
    v-model="displayedChildren"
    class="drag-area"
    :group="group"
    :animation="200"
    ghost-class="ghost"
    draggable=".item"
    handle=".handle"
    @change="change"
  >
    <tree-node
      v-for="child in displayedChildren"
      :key="child.doc._id"
      class="item"
      :node="child.doc"
      :children="child.children"
      :group="group"
      :selected-node="selectedNode"
      :selected="selectedNode && selectedNode._id === child.doc._id"
      :ancestors-of-selected-node="ancestorsOfSelectedNode"
      :organize="organize"
      :lazy="lazy"
      :start-expanded="startExpanded"
      :show-external-details="showExternalDetails"
      @selected="e => $emit('selected', e)"
      @move-within-root="e => $emit('move-within-root', e)"
      @move-between-roots="e => $emit('move-between-roots', e)"
    />
  </draggable>
</template>

<script lang="js">
import draggable from 'vuedraggable';
import TreeNode from '/imports/client/ui/components/tree/TreeNode.vue';

export default {
  components: {
    draggable,
    TreeNode,
  },
  props: {
    node: {
      type: Object,
      default: undefined,
    },
    root: {
      type: Object,
      required: true,
    },
    group: {
      type: String,
      default: undefined,
    },
    organize: Boolean,
    lazy: Boolean,
    children: {
      type: Array,
      default: () => [],
    },
    selectedNode: {
      type: Object,
      default: undefined,
    },
    ancestorsOfSelectedNode: {
      type: Array,
      default: () => [],
    },
    startExpanded: Boolean,
    showExternalDetails: Boolean,
  },
  data() {
    return {
      expanded: this.startExpanded || false,
      displayedChildren: [],
    }
  },
  computed: {
    hasChildren() {
      return this.children && this.children.length;
    },
    showExpanded() {
      return this.expanded && (this.organize || this.hasChildren)
    },
  },
  watch: {
    children(value) {
      this.displayedChildren = value;
    }
  },
  mounted() {
    this.displayedChildren = this.children;
  },
  methods: {
    change({ added, moved }) {
      let event = moved || added;
      if (event) {
        let doc = event.element.doc;
        let newPosition;
        if (!this.children.length) {
          if (this.node) {
            newPosition = this.node.left + 0.5;
          } else {
            newPosition = 0.5;
          }
        } else if (event.newIndex < this.children.length) {
          let childAtNewIndex = this.children[event.newIndex];
          if (event.newIndex > event.oldIndex) {
            newPosition = childAtNewIndex.doc.right + 0.5;
          } else {
            newPosition = childAtNewIndex.doc.left - 0.5;
          }
        } else {
          let childBeforeNewIndex = this.children[event.newIndex - 1];
          newPosition = childBeforeNewIndex.doc.right + 0.5;
        }
        if (doc.root.id === this.root.id) {
          this.$emit('move-within-root', { doc, newPosition });
        } else {
          this.$emit('move-between-roots', { doc, newPosition, newRootRef: this.root });
        }
      }
    },
  },
};
</script>

<style lang="css" scoped>
.flip-list-leave-active {
  display: none;
}

.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}
</style>
