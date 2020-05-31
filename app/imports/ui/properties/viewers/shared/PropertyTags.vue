<template lang="html">
  <div
    v-if="tagString"
    class="tags ma-3 "
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
    }
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
