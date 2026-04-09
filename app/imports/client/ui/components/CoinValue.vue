<template lang="html">
  <div>
    <span
      v-if="coinValue.gp || value === 0"
    >
      {{ coinValue.gp }} gp
    </span>
    <span
      v-if="coinValue.sp || (coinValue.gp && coinValue.cp)"
    >
      {{ coinValue.sp }} sp
    </span>
    <span
      v-if="coinValue.cp"
    >
      {{ coinValue.cp }} cp
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import valueToCoins from '/imports/client/ui/utility/valueToCoins';

const props = defineProps<{
  value?: number;
}>();

const coinValue = computed(() => valueToCoins(props.value));
</script>

<style lang="css" scoped>
</style>
