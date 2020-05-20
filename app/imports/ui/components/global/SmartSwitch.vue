<template lang="html">
  <v-switch
    v-bind="$attrs"
    :loading="loading"
    :error-messages="errors"
    :input-value="safeValue"
    :disabled="isDisabled"
    @change="change"
  />
</template>

<script>
  import SmartInput from '/imports/ui/components/global/SmartInputMixin.js';

  export default {
    mixins: [SmartInput],
  };
</script>
