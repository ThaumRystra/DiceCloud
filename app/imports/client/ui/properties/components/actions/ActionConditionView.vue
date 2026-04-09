<template lang="html">
  <div
    v-if="insufficient"
    class="d-flex align-center justify-start text-error"
  >
    <div
      class="mr-2 text-no-wrap text-truncate"
      style="min-width: 24px; text-align: center;"
    >
      {{ model.conditionNote || (model.condition && model.condition.calculation) || 'No condition specified' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  model?: Record<string, any>;
}>(), {
  model: () => ({}),
});

const insufficient = computed(() => !props.model.condition?.value);
</script>
