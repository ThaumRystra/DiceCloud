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
export default {
  props: {
    percent: {
      type: Number,
      required: true
    }
  },
  computed: {
    fillStyle() {
      return {
        '--p': `${this.percent}%`
      };
    }
  }
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
  background: conic-gradient(red var(--p),#0000 0);
  background-color: #5e1010; /* adjust the color as needed */
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