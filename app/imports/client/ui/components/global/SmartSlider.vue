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
  regular?: boolean;
}>();

const emit = defineEmits<{
  change: [val: unknown, ack: (err?: unknown) => void];
  input: [val: unknown];
  end: [val: unknown];
  start: [val: unknown];
}>();

const attrs = useAttrs();
const { loading, errors, safeValue, isDisabled, focused, change } = useSmartInput(props, emit, attrs);
</script>

<template lang="html">
  <v-slider
    ref="input"
    v-bind="$attrs"
    class="dc-text-field"
    :hide-details="!(errors && errors.length)"
    :loading="loading"
    :error-messages="errors"
    :model-value="safeValue"
    :disabled="isDisabled"
    @end="e => { change(e); $emit('end', e) }"
    @update:model-value="e => $emit('input', e)"
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
