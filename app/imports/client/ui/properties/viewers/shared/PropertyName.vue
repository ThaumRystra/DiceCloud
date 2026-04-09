<template lang="html">
  <div class="name text-h5 mb-2">
    {{ value }}
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  value?: string;
}>(), {
  value: undefined,
});
</script>
