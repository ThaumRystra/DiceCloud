<template lang="html">
  <markdown-text
    v-if="model"
    :markdown="model.value"
  />
</template>

<script lang="js">
import MarkdownText from '/imports/ui/components/MarkdownText.vue';

export default {
	components: {
    MarkdownText,
	},
	props: {
		model: {
      type: Object,
      default: undefined,
    },
	},
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
