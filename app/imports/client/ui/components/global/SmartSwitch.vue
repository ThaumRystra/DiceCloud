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

<script lang="js">
  import SmartInput from '/imports/client/ui/components/global/SmartInputMixin';

  export default {
    mixins: [SmartInput],
  };
</script>
