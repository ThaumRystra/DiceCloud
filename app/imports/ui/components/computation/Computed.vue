<template lang="html">
  <markdown-text
    v-if="embedded"
    :markdown="computedValue"
  />
  <div
    v-else
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
import evalutateStringWithEmbeddedCalculations from '/imports/api/creature/computation/afterComputation/evalutateStringWithEmbeddedCalculations.js';
import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
import MarkdownText from '/imports/ui/components/MarkdownText.vue';

export default {
  components: {
    MarkdownText,
  },
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
    embedded: {
      type: Boolean,
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
      if (this.embedded){
        let result = evalutateStringWithEmbeddedCalculations(this.value, this.scope);
        this.computedValue = result;
      } else {
        let {result, errors} = evaluateString(this.value, this.scope);
        if (this.signed){
          result = numberToSignedString(result);
        }
        this.computedValue = result;
        this.errors = errors;
      }
    }
  }
}
</script>

<style lang="css">
  .computed {
    display: inline-block;
  }
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
