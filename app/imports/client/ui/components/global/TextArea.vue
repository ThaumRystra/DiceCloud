<template lang="html">
  <v-textarea
    v-bind="$attrs"
    :loading="loading"
    :error-messages="errors"
    :model-value="safeValue"
    :disabled="isDisabled"
    :auto-grow="autoGrow"
    variant="outlined"
    @update:model-value="input"
    @focus="focused = true"
    @blur="focused = false"
  />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue';
import { useSmartInput } from '/imports/client/ui/components/global/useSmartInput';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  value?: string | number | Date | unknown[] | object | boolean;
  errorMessages?: string | string[];
  disabled?: boolean;
  debounce?: number;
  rules?: Array<(val: unknown) => string | true>;
  autoGrow?: boolean;
}>();

const emit = defineEmits<{
  change: [val: unknown, ack: (err?: unknown) => void];
  input: [val: unknown];
}>();

const attrs = useAttrs();
const { loading, errors, safeValue, isDisabled, focused, input } = useSmartInput(props, emit, attrs);
</script>
