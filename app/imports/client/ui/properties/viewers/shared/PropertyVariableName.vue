<script setup lang="ts">
withDefaults(defineProps<{
  value?: string;
}>(), {
  value: undefined,
});
</script>

<template lang="html">
  <div
    v-if="value"
    class="mb-3"
  >
    <code>{{ value }}</code>
  </div>
</template>

