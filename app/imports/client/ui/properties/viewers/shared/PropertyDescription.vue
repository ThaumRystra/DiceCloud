<template lang="html">
  <markdown-text
    v-if="text && model"
    :markdown="textValue"
  />
  <property-field
    v-else-if="model && textValue"
    :name="name"
    :cols="{cols: 12}"
  >
    <markdown-text :markdown="textValue" />
  </property-field>
</template>

<script lang="js">
import MarkdownText from '/imports/client/ui/components/MarkdownText.vue';
import PropertyField from '/imports/client/ui/properties/viewers/shared/PropertyField.vue';

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
    text: Boolean,
  },
  computed: {
    textValue() {
      if (!this.model) return;
      if (typeof this.model.value === 'string') {
        return this.model.value;
      } else {
        return this.model.text
      }
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
  font-family: monospace, monospace;
}

.computed .math-binary-operator {
  margin: 0 6px;
}
</style>
