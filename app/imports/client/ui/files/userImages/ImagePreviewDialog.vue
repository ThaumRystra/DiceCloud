<template lang="html">
  <img
    class="preview-image v-sheet v-card elevation-6"
    :src="href"
    @click="back"
  >
</template>

<script lang="js">
export default {
  props: {
    href: {
      type: String,
      required: true,
    },
  },
  methods: {
    back() {
      this.$store.dispatch('popDialogStack');
    },
  }
};
</script>

<style lang="css" scoped>
.preview-image {
  max-height: 100%;
  max-width: 100%;
  cursor: zoom-out;
}
</style>
