<script setup lang="ts">
import { ref, computed, inject, useAttrs, onBeforeUnmount } from 'vue';
import { debounce } from 'lodash';

defineOptions({ inheritAttrs: false });

const context = inject<{ editPermission?: boolean; debounceTime?: number }>('context', {});

const props = defineProps<{
  value?: string | number | Date | unknown[] | object | boolean;
  errorMessages?: string | string[];
  disabled?: boolean;
  debounce?: number;
  rules?: Array<(val: unknown) => string | true>;
  multiple?: boolean;
}>();

const emit = defineEmits<{
  change: [val: unknown, ack: (err?: unknown) => void];
  input: [val: unknown];
}>();

const attrs = useAttrs();

const error = ref(false);
const ackErrors = ref<string | null>(null);
const rulesErrors = ref<string[] | null>(null);
const focused = ref(false);
const loading = ref(false);
const dirty = ref(false);
const safeValue = ref(props.value);
const searchInput = ref('');

const errors = computed(() => {
  const errs: string[] = ackErrors.value ? [ackErrors.value] : [];
  if (Array.isArray(rulesErrors.value)) errs.push(...rulesErrors.value);
  if (Array.isArray(props.errorMessages)) errs.push(...props.errorMessages);
  else if (typeof props.errorMessages === 'string' && props.errorMessages) errs.push(props.errorMessages);
  return errs;
});

const isDisabled = computed(() => context.editPermission === false || props.disabled);

const debounceTime = computed(() => {
  if (Number.isFinite(props.debounce)) return props.debounce as number;
  if (Number.isFinite(context.debounceTime)) return context.debounceTime as number;
  return props.multiple ? 1000 : 100;
});

const debouncedChange = debounce(change, debounceTime.value);

onBeforeUnmount(() => {
  debouncedChange.flush();
});

function change(val: unknown) {
  dirty.value = true;
  if (attrs.onChange) loading.value = true;
  emit('change', val, acknowledgeChange);
}

function acknowledgeChange(err?: unknown) {
  loading.value = false;
  dirty.value = false;
  error.value = !!err;
  if (!err) {
    ackErrors.value = null;
  } else if (typeof err === 'string') {
    ackErrors.value = err;
  } else if ((err as any).reason) {
    ackErrors.value = (err as any).reason;
  } else if ((err as any).message) {
    ackErrors.value = (err as any).message;
  } else {
    ackErrors.value = 'Something went wrong';
    console.error(err);
  }
}

function customChange(val: unknown) {
  debouncedChange(val);
  searchInput.value = '';
}
</script>

<template lang="html">
  <v-combobox
    v-bind="$attrs"
    v-model:search="searchInput"
    :loading="loading"
    :error-messages="errors"
    :model-value="safeValue"
    :menu-props="{}"
    :disabled="isDisabled"
    :multiple="multiple"
    variant="outlined"
    @update:model-value="customChange"
    @focus="focused = true"
    @blur="focused = false"
  >
    <template #prepend>
      <slot name="prepend" />
    </template>
  </v-combobox>
</template>
