<script setup lang="ts">
import { ref, useAttrs } from 'vue';
import { useSmartInput } from '/imports/client/ui/components/global/useSmartInput';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  value?: string | number | Date | unknown[] | object | boolean;
  errorMessages?: string | string[];
  disabled?: boolean;
  debounce?: number;
  rules?: Array<(val: unknown) => string | true>;
  regular?: boolean;
}>();

const emit = defineEmits<{
  change: [val: unknown, ack: (err?: unknown) => void];
  input: [val: unknown];
  keyup: [e: KeyboardEvent];
}>();

const attrs = useAttrs();
const { loading, errors, safeValue, isDisabled, focused, input } = useSmartInput(props, emit, attrs);
</script>

<template lang="html">
  <v-text-field
    ref="input"
    v-bind="$attrs"
    class="dc-text-field"
    :loading="loading"
    :error-messages="errors"
    :model-value="safeValue"
    :disabled="isDisabled"
    :variant="regular ? 'filled' : 'outlined'"
    @update:model-value="input"
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

<style lang="css">
.dc-text-field .v-input__append-inner{
  font-size: 12px;
  margin-top: 36px;
}
</style>
