<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  model?: Record<string, any>;
}>(), {
  model: () => ({}),
});

const insufficient = computed(() => props.model.quantity > props.model.available);
</script>

<template lang="html">
  <div
    class="d-flex align-center justify-start"
    :class="insufficient && 'text-error'"
  >
    <div
      v-if="model.quantity && model.quantity.value !== 1"
      class="mr-2 text-no-wrap text-truncate"
      style="min-width: 24px; text-align: center;"
    >
      {{ model.quantity.value }}
    </div>
    <div
      v-if="model.quantity && (typeof model.quantity.value !== 'string')"
      class="text-no-wrap text-truncate"
    >
      {{ model.statName || model.variableName }}
    </div>
    <div
      v-if="(typeof model.available) == 'number'"
      class="text-disabled text-no-wrap text-truncate ml-1 flex-shrink-0"
    >
      ({{ model.available }})
    </div>
  </div>
</template>
