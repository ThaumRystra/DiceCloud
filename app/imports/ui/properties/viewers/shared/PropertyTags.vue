<template lang="html">
  <div
    v-if="tagString"
    class="tags"
    :class="{'ma-3': !noMargin}"
  >
    {{ tagString }}
  </div>
</template>

<script>
export default {
  props:{
    tags: {
      type: Array,
      default: () => [],
    },
    noMargin: Boolean,
  },
  computed:{
    tagString(){
      return this.tags.join(', ');
    },
  }
}
</script>

<style lang="css" scoped>
.tags {
  font-style: italic;
}
</style>
