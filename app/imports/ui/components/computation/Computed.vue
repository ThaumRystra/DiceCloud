<template lang="html">
  <div
    class="computed"
    :class="{
      'symbols-are-errors': expectNumber && scope,
      'code': errors.length,
    }"
    v-html="computedValue"
  />
</template>

<script>
import evaluateString from '/imports/api/creature/computation/afterComputation/evaluateString.js';
import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';

export default {
  props: {
    value: {
      type: String,
      default: '',
    },
    scope: {
      type: Object,
      default: undefined,
    },
    expectNumber: {
      type: Boolean,
      default: true,
    },
    signed: {
      type: Boolean
    },
  },
  data(){return {
    errors: false,
    computedValue: '',
  }},
  watch: {
    value(){
      this.recalculate();
    },
    scope(){
      this.recalculate();
    },
  },
  mounted(){
    this.recalculate();
  },
  methods: {
    recalculate(){
      if (!this.value) return;
      let {result, errors} = evaluateString(this.value, this.scope);
      if (this.signed){
        result = numberToSignedString(result);
      }
      this.computedValue = result;
      this.errors = errors;
    }
  }
}
</script>

<style lang="css">
  .computed.symbols-are-errors .math-symbol {
    color: red;
  }
  .computed.code {
    font-family: monospace,monospace;
  }
  .computed .math-binary-operator {
    margin: 0 6px;
  }
</style>
