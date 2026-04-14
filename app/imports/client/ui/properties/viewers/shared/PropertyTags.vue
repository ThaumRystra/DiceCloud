<script setup lang="ts">
withDefaults(defineProps<{
  tags?: string[];
  noMargin?: boolean;
  prefix?: string;
}>(), {
  tags: () => [],
  prefix: undefined,
});
</script>

<template lang="html">
  <div
    v-if="tags.length"
    class="tags"
    :class="{'ma-2': !noMargin}"
  >
    <span
      v-if="prefix"
      class="mx-1 text-overline"
    >
      {{ prefix }}
    </span>
    <v-chip
      v-for="(tag, i) in tags"
      :key="tag + i"
      class="mx-1"
    >
      {{ tag }}
    </v-chip>
  </div>
</template>

<style lang="css" scoped>
</style>
