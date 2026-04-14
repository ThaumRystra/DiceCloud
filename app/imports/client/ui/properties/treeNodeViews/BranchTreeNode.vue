<script setup lang="ts">
import { computed } from 'vue';
import PROPERTIES from '/imports/constants/PROPERTIES';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';

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

const name = computed(() => {
  switch (props.model.branchType) {
    case 'if': return 'On condition';
    case 'hit': return 'On hit';
    case 'miss': return 'On miss';
    case 'failedSave': return 'On failed save';
    case 'successfulSave': return 'On save';
    case 'eachTarget': return 'Each target';
    case 'random': return 'Pick one at random';
    case 'index': return 'Pick one by index';
    case 'choice': return 'User choice';
    default: return '';
  }
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
    <div class="text-no-wrap text-truncate">
      {{ name }}
    </div>
  </div>
</template>
