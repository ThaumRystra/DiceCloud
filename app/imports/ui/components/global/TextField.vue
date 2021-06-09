<template lang="html">
  <v-text-field
    ref="input"
    v-bind="$attrs"
    :loading="loading"
    :error-messages="errors"
    :value="safeValue"
    :disabled="isDisabled"
    :outlined="!regular"
    @input="input"
    @focus="focused = true"
    @blur="focused = false"
    @keyup="e => $emit('keyup', e)"
  />
</template>

<script lang="js">
  import SmartInput from '/imports/ui/components/global/SmartInputMixin.js';

  export default {
    mixins: [SmartInput],
    props: {
      regular: Boolean,
    },
  };
</script>
