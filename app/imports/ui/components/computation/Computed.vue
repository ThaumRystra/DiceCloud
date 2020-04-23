<template lang="html">
  <div
    v-html="computedValue"
    class="computed"
    :class="expectNumber && 'symbols-are-errors'"
  />
</template>

<script>
import evaluateString from '/imports/api/creature/computation/afterComputation/evaluateString.js';
import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
import { isFinite } from 'lodash';

export default {
  props: {
    value: {
      type: String,
    },
    scope: {
      type: Object,
    },
    expectNumber: {
      type: Boolean,
      default: true,
    },
    signed: {
      type: Boolean
    },
  },
  computed: {
    computedValue(){
      if (!this.value) return;
      let {result, errors} = evaluateString(this.value, this.scope);
      if (this.signed){
        result = numberToSignedString(result);
      }
      return result;
    }
  }
}
</script>

<style lang="css">
  .computed.symbols-are-errors .math-symbol {
    color: red;
  }
</style>
