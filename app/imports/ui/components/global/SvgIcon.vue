<template lang="html">
  <i
    ref="icon"
    aria-hidden
    role="img"
    class="v-icon"
    :class="themeClasses"
    :style="color && `color: ${color}`"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      :style="`height: ${size}; width: ${size}`"
    >
      <path
        :d="shape"
      />
    </svg>
  </i>
</template>

<script>
const SIZE_MAP = {
  xSmall: '12px',
  small: '16px',
  default: '24px',
  medium: '28px',
  large: '36px',
  xLarge: '40px',
}
export default {
  inject: {
    theme: {
      default: {
        isDark: false,
      },
    },
  },
  props: {
    shape: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: undefined,
    },
    xSmall: Boolean,
    small: Boolean,
    medium: Boolean,
    large: Boolean,
    xLarge: Boolean,
  },
  data(){return {
    inheritedSize: undefined,
  }},
  computed: {
    isDark () {
      if (this.dark === true) {
        // explicitly dark
        return true
      } else if (this.light === true) {
        // explicitly light
        return false
      } else {
        // inherit from parent, or default false if there is none
        return this.theme.isDark
      }
    },
    themeClasses() {
      return {
        'theme--dark': this.isDark,
        'theme--light': !this.isDark,
      }
    },
    size() {
      if (this.inheritedSize) return this.inheritedSize;
      if (this.xSmall) return SIZE_MAP['xSmall'];
      if (this.small)  return SIZE_MAP['small'];
      if (this.medium) return SIZE_MAP['medium'];
      if (this.large)  return SIZE_MAP['large'];
      if (this.xLarge) return SIZE_MAP['xLarge'];
      return SIZE_MAP['default'];
    },
  },
  mounted(){
    this.inheritedSize = this.$refs.icon.style.fontSize;
  }
}
</script>

<style lang="css" scoped>
  svg {
    color: inherit;
    fill: currentColor;
  }
</style>
