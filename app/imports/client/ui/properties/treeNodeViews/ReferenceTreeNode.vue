<script setup lang="ts">
import { defineAsyncComponent, computed } from 'vue';
import PROPERTIES from '/imports/constants/PROPERTIES';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';

const TreeNodeView = defineAsyncComponent(
  () => import('/imports/client/ui/properties/treeNodeViews/TreeNodeView.vue')
);

const props = withDefaults(defineProps<{
  model?: Record<string, any>;
  selected?: boolean;
  hideIcon?: boolean;
}>(), {
  model: () => ({}),
  selected: false,
  hideIcon: false,
});

const title = computed(() => {
  const model = props.model;
  if (!model) return;
  if (model.name) return model.name;
  const prop = (PROPERTIES as any)[model.type];
  return prop && prop.name;
});
</script>

<template lang="html">
  <div class="d-flex align-center justify-start">
    <property-icon
      v-if="!hideIcon"
      class="mr-2"
      :model="model"
      :color="model.color"
      :class="selected && 'text-primary'"
    />
    <tree-node-view
      v-if="model.cache && model.cache.node && model.cache.node.type !== 'reference'"
      :model="model.cache.node"
    />
    <div
      v-else
      class="text-no-wrap text-truncate"
    >
      {{ model.cache.node && model.cache.node.name || title }}
    </div>
  </div>
</template>
