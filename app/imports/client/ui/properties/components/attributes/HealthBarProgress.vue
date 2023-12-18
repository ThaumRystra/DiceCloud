<template lang="html">
  <div
    class="bar"
    @click="e => $emit('click', e)"
  >
    <div
      style="width: 100%; position: relative; transition: background-color 0.5s ease;"
      :style="{
        backgroundColor: barBackgroundColor,
        height: `${height}px`,
      }"
    >
      <div
        class="filler"
        style="height: 100%; transform-origin: left; transition: all 0.5s ease;"
        :style="{
          backgroundColor: barColor,
          transform: `scaleX(${fillFraction})`,
        }"
      />
      <slot />
    </div>
  </div>
</template>

<script lang="js">
import chroma from 'chroma-js';
export default {
  props: {
    model: {
      type: Object,
      required: true,
    },
    height: {
      type: Number,
      default: 24,
    },
  },
  computed: {
    fillFraction() {
      let fraction = this.model.value / this.model.total;
      if (fraction < 0) fraction = 0;
      if (fraction > 1) fraction = 1;
      return fraction;
    },
    color() {
      return this.model.color || this.$vuetify.theme.currentTheme.primary
    },
    barColor() {
      const fraction = this.model.value / this.model.total;
      if (!Number.isFinite(fraction)) return this.color;
      if (fraction > 0.5) {
        return this.color;
      } else if (this.model.healthBarColorMid && this.model.healthBarColorLow) {
        return chroma.mix(this.model.healthBarColorLow, this.model.healthBarColorMid, fraction * 2).hex();
      } else if (this.model.healthBarColorMid) {
        return this.model.healthBarColorMid;
      }
      return this.color;
    },
    barBackgroundColor() {
      return chroma(this.barColor)
        .darken(1.5)
        .desaturate(1.5)
        .hex();
    },
  },
}
</script>