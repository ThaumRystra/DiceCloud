<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from 'vuetify';
import chroma from 'chroma-js';

const vuetifyTheme = useTheme();

const props = defineProps<{
  model: {
    value: number;
    total: number;
    color?: string;
    healthBarColorMid?: string;
    healthBarColorLow?: string;
  };
}>();

const fillFraction = computed(() => {
  let fraction = props.model.value / props.model.total;
  if (fraction < 0) fraction = 0;
  if (fraction > 1) fraction = 1;
  return fraction;
});

const color = computed(() => {
  return props.model.color || vuetifyTheme.current.value.colors.primary;
});

const barColor = computed(() => {
  const fraction = props.model.value / props.model.total;
  if (!Number.isFinite(fraction)) return color.value;
  if (fraction > 0.5) {
    return color.value;
  } else if (props.model.healthBarColorMid && props.model.healthBarColorLow) {
    return chroma.mix(props.model.healthBarColorLow, props.model.healthBarColorMid, fraction * 2).hex();
  } else if (props.model.healthBarColorMid) {
    return props.model.healthBarColorMid;
  }
  return color.value;
});

const barBackgroundColor = computed(() => {
  return chroma(barColor.value)
    .darken(1.5)
    .desaturate(1.5)
    .hex();
});

const fillStyle = computed(() => ({
  '--p': `${100 - (fillFraction.value * 100)}%`,
  background: `conic-gradient(#0000 var(--p), ${barColor.value} var(--p))`,
  backgroundColor: barBackgroundColor.value,
}));
</script>

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
