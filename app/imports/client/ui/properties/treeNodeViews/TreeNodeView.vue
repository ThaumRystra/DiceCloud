<template lang="html">
  <component
    :is="treeNodeView"
    :model="model"
    :selected="selected"
    :class="{
      'inactive': model.inactive,
    }"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import treeNodeViewIndex from '/imports/client/ui/properties/treeNodeViews/treeNodeViewIndex';

const props = defineProps<{
  model: Record<string, any>;
  selected?: boolean;
}>();

const treeNodeView = computed(() => {
  const type = props.model.type;
  return (treeNodeViewIndex as any)[type] || (treeNodeViewIndex as any).default;
});
</script>

<style lang="css" scoped>
  .inactive {
    opacity: 0.6;
  }
</style>
