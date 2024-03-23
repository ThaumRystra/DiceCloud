<template lang="html">
  <div class="build-tree-node-list">
    <build-tree-node
      v-for="child in children"
      :key="child.doc._id"
      :doc="child.doc"
      :children="child.children"
      :parent-slot-id="parentSlotId"
      :depth="depth + 1"
      @selected="e => $emit('selected', e)"
    />
  </div>
</template>

<script lang="js">
import BuildTreeNode from '/imports/client/ui/creature/buildTree/BuildTreeNode.vue';

export default {
  components: {
    BuildTreeNode,
  },
  props: {
    children: {
      type: Array,
      default: () => [],
    },
    parentSlotId: {
      type: String,
      default: undefined,
    },
    depth: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      expanded: false,
    }
  },
};
</script>
