<template lang="html">
  <markdown-text
    :markdown="computedValue"
  />
</template>

<script lang="js">
import MarkdownText from '/imports/ui/components/MarkdownText.vue';
//import embedInlineCalculations from '/imports/api/creature/computation/afterComputation/embedInlineCalculations.js';

export default {
  components: {
    MarkdownText,
  },
  props: {
    string: {
      type: String,
      default: '',
    },
    calculations: {
      type: Array,
      default(){
        return [];
      },
    },
    inactive: Boolean,
  },
  computed: {
    computedValue(){
      if (this.inactive) return this.string;
      //return embedInlineCalculations(this.string, this.calculations);
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
