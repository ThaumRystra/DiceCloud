<template lang="html">
  <img
    class="preview-image v-sheet v-card elevation-6"
    :class="themeClasses"
    :src="href"
    @click="back"
  >
</template>

<script lang="js">
export default {
  inject: {
    theme: {
      default: {
        isDark: false,
      },
    },
  },
  props: {
    href: {
      type: String,
      required: true,
    },
  },
 computed: {
    themeClasses() {
      return {
        'theme--dark': this.theme.isDark,
        'theme--light': !this.theme.isDark,
      }
    },
  },
  methods: {
    back() {
      this.$store.dispatch('popDialogStack');
    },
  },
};
</script>

<style lang="css" scoped>
.preview-image {
  max-height: 100%;
  max-width: 100%;
  cursor: zoom-out;
}
</style>
