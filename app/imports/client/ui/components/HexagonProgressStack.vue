<template>
  <div
    v-if="!bars.length"
    class="hexagon-content"
  >
    <slot />
  </div>
  <hexagon-progress
    v-else
    :model="bars[0]"
  >
    <slot v-if="bars.length === 1" />
    <hexagon-progress-stack
      v-else
      :bars="tailBars"
      class="child"
    >
      <slot />
    </hexagon-progress-stack>
  </hexagon-progress>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { tail } from 'lodash';
import HexagonProgress from '/imports/client/ui/components/HexagonProgress.vue';

const props = defineProps<{
  bars: {
    value: number;
    total: number;
    color?: string;
    healthBarColorMid?: string;
    healthBarColorLow?: string;
  }[];
}>();

const tailBars = computed(() => tail(props.bars));
</script>

<style scoped>
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

.child {
  width: 100%;
  height: 100%;
}
</style>
