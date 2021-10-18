<template lang="html">
  <property-field
    v-if="model && (model.value || model.text)"
    :name="name"
    :cols="{col: 12}"
  >
    <markdown-text
      :markdown="model.value || model.text"
    />
  </property-field>
</template>

<script lang="js">
import MarkdownText from '/imports/ui/components/MarkdownText.vue';
import PropertyField from '/imports/ui/properties/viewers/shared/PropertyField.vue';

export default {
	components: {
    MarkdownText,
    PropertyField,
	},
	props: {
		model: {
      type: Object,
      default: undefined,
    },
    name: {
      type: String,
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
