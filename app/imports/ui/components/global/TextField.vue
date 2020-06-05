<template lang="html">
  <v-text-field
    ref="input"
    v-bind="$attrs"
    :loading="loading"
    :error-messages="errors"
    :value="safeValue"
    :disabled="isDisabled"
    box
    @input="input"
    @focus="focused = true"
    @blur="focused = false"
  />
</template>

<script>
  import SmartInput from '/imports/ui/components/global/SmartInputMixin.js';

  export default {
    mixins: [SmartInput],
  };
</script>
