<template lang="html">
  <div class="d-flex align-center justify-start">
    <proficiency-icon
      v-if="!hideIcon"
      class="mr-2"
      :class="selected && 'text-primary'"
      :color="model.color"
      :value="model.value"
    />
    <div class="text-no-wrap text-truncate">
      <template v-if="!model.name && model.stats && model.stats.length">
        {{ model.stats.join(', ') }}
      </template>
      <template v-else>
        {{ title }}
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PROPERTIES from '/imports/constants/PROPERTIES';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';
import ProficiencyIcon from '/imports/client/ui/properties/shared/ProficiencyIcon.vue';

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
