<script setup lang="ts">
import { ref } from 'vue';
import BuildTreeNode from '/imports/client/ui/creature/buildTree/BuildTreeNode.vue';

withDefaults(defineProps<{
  children?: any[];
  parentSlotId?: string;
  depth?: number;
}>(), {
  children: () => [],
  parentSlotId: undefined,
  depth: 0,
});

const expanded = ref(false);
</script>

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
