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

<script>
import valueToCoins from '/imports/ui/utility/valueToCoins.js';

export default {
  props:{
    value: {
      type: Number,
      default: undefined,
    },
  },
  computed:{
    coinValue(){
      return valueToCoins(this.value);
    }
  },
}
</script>

<style lang="css" scoped>
</style>
