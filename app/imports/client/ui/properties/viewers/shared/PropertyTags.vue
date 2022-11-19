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

<script lang="js">
export default {
  props:{
    tags: {
      type: Array,
      default: () => [],
    },
    noMargin: Boolean,
    prefix: {
      type: String,
      default: undefined,
    }
  },
}
</script>

<style lang="css" scoped>
</style>
