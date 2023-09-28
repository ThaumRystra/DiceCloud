<template lang="html">
  <v-slider
    ref="input"
    v-bind="$attrs"
    class="dc-text-field"
    :hide-details="!(errors && errors.length)"
    :loading="loading"
    :error-messages="errors"
    :value="safeValue"
    :disabled="isDisabled"
    :outlined="!regular"
    @change="change"
    @input="e => $emit('input', e)"
    @end="e => $emit('end', e)"
    @start="e => $emit('start', e)"
    @focus="focused = true"
    @blur="focused = false"
  >
    <template #prepend>
      <slot name="prepend" />
    </template>
    <template #append>
      <slot name="append" />
    </template>
  </v-slider>
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
