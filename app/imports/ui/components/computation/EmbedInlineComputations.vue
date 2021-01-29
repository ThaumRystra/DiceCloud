<template lang="html">
  <markdown-text
    :markdown="computedValue"
  />
</template>

<script>
import MarkdownText from '/imports/ui/components/MarkdownText.vue';

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
  },
  computed: {
    computedValue(){
      if (!this.string) return '';
      let index = 0;
      return this.string.replace(/\{([^{}]*)\}/g, () => {
        let comp = this.calculations && this.calculations[index++];
        return comp && comp.result;
      });
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
