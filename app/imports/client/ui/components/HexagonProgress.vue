<template>
  <div
    class="hexagon-progress"
    :style="fillStyle"
  >
    <div class="hexagon-content">
      <slot />
    </div>
  </div>
</template>

<script>
import chroma from 'chroma-js';
export default {
  props: {
    model: {
      type: Object,
      required: true
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
    fillStyle() {
      return {
        '--p': `${100 - (this.fillFraction * 100)}%`,
        background: `conic-gradient(#0000 var(--p), ${this.barColor} var(--p))`,
        backgroundColor: this.barBackgroundColor,
      };
    }
  },
};
</script>

<style>
.hexagon-progress {
  position: relative;
  clip-path: polygon(
    50% 0%,
    100% 25%,
    100% 75%,
    50% 100%,
    0% 75%,
    0% 25%
  );
  background: conic-gradient(#0000 var(--p), red var(--p));
  background-color: #5e1010;
}

.hexagon-content {
  position: absolute;
  inset: 4px;
  background-color: #252525;
  clip-path: polygon(
    50% 0%,
    100% 25%,
    100% 75%,
    50% 100%,
    0% 75%,
    0% 25%
  );
}
</style>