<template lang="html">
  <v-textarea
    v-bind="$attrs"
    :loading="loading"
    :error-messages="errors"
    :value="safeValue"
    :disabled="isDisabled"
    :auto-grow="autoGrow"
    outlined
    @input="input"
    @focus="focused = true"
    @blur="focused = false"
  />
</template>

<script lang="js">
import SmartInput from '/imports/client/ui/components/global/SmartInputMixin';

export default {
  mixins: [SmartInput],
  props: {
    autoGrow: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
