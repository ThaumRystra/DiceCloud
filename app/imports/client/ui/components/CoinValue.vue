<template lang="html">
  <div>
    <span
      v-if="coinValue.gp || value === 0"
    >
      {{ $t('CoinValue.JL2Z6mOZhL5dcBjOJcsvA', [coinValue.gp]) }}
    </span>
    <span
      v-if="coinValue.sp || (coinValue.gp && coinValue.cp)"
    >
      {{ $t('CoinValue.3tH0b_R7B-Ge65HtL6fgY', [coinValue.sp]) }}
    </span>
    <span
      v-if="coinValue.cp"
    >
      {{ $t('CoinValue.Ig9s8fiNqqshG8DBauG-f', [coinValue.cp]) }}
    </span>
  </div>
</template>

<script lang="js">
import valueToCoins from '/imports/client/ui/utility/valueToCoins';

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
