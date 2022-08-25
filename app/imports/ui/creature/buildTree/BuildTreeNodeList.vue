<template lang="html">
  <div class="build-tree-node-list">
    <build-tree-node
      v-for="child in children"
      :key="child.node._id"
      :node="child.node"
      :children="child.children"
      :parent-slot-id="parentSlotId"
      @selected="e => $emit('selected', e)"
    />
  </div>
</template>

<script lang="js">
  import BuildTreeNode from '/imports/ui/creature/buildTree/BuildTreeNode.vue';

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
    },
    data(){ return {
      expanded: false,
    }},
  };
</script>
