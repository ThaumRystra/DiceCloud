<template lang="html">
  <v-text-field
    ref="input"
    v-bind="$attrs"
    class="dc-text-field"
    :loading="loading"
    :error-messages="errors"
    :value="safeValue"
    :disabled="isDisabled"
    :outlined="!regular"
    @input="input"
    @focus="focused = true"
    @blur="focused = false"
    @keyup="e => $emit('keyup', e)"
  >
    <template #append>
      <slot name="value" />
    </template>
    <template #prepend>
      <slot name="prepend" />
    </template>
  </v-text-field>
</template>

<script lang="js">
  import SmartInput from '/imports/client/ui/components/global/SmartInputMixin';

  export default {
    mixins: [SmartInput],
    props: {
      regular: Boolean,
    },
  };
</script>

<style lang="css">
.dc-text-field .v-input__append-inner{
  font-size: 12px;
  margin-top: 36px;
}
</style>
