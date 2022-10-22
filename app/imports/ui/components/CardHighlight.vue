<template lang="html">
  <div
    v-if="dark || theme.isDark"
    class="overlay"
    :class="{active, 'extra-bright': dark && !theme.isDark}"
  />
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
      active: Boolean,
      dark: Boolean,
    },
  }
</script>

<style lang="css" scoped>
  .overlay {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    pointer-events: none;
    background-color: #fff;
    opacity: 0;
    transition: opacity 0.1s linear;
  }
  .overlay.active {
    opacity: 0.08;
  }
  .overlay.active.extra-bright {
    opacity: 0.3;
  }
</style>
