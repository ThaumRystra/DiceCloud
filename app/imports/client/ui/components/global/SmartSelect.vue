<template lang="html">
  <v-select
    v-bind="$attrs"
    :loading="loading"
    :error-messages="errors"
    :value="safeValue"
    :menu-props="{auto: true, lazy: true}"
    :disabled="isDisabled"
    outlined
    @change="change"
    @focus="focused = true"
    @blur="focused = false"
  >
    <slot
      slot="prepend"
      name="prepend"
    />
    <slot
      slot="prepend-inner"
      name="prepend-inner"
    />
  </v-select>
</template>

<script lang="js">
import SmartInput from '/imports/client/ui/components/global/SmartInputMixin';

export default {
  mixins: [SmartInput],
};
</script>
