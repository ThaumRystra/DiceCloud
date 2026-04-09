/*
 * Composable to handle inputs that update the database.
 * Won't bash the field's value while it's focused, even if the database trims
 * or otherwise sanitizes the data captured.
 *
 * Emits a change event that requires acknowledgement with an optional error
 * message if something went wrong
 */
import { ref, computed, watch, nextTick, onBeforeUnmount, inject } from 'vue';
import { debounce } from 'lodash';

type SmartInputProps = {
  value?: string | number | Date | unknown[] | object | boolean | null;
  errorMessages?: string | string[];
  disabled?: boolean;
  debounce?: number;
  rules?: Array<(val: unknown) => string | true>;
};

type SmartInputEmits = (event: 'change' | 'input', ...args: any[]) => void;

export function useSmartInput(
  props: SmartInputProps,
  emit: SmartInputEmits,
  attrs: Record<string, unknown>,
) {
  const context = inject<{ editPermission?: boolean; debounceTime?: number }>('context', {});

  const error = ref(false);
  const ackErrors = ref<string | null>(null);
  const rulesErrors = ref<string[] | null>(null);
  const focused = ref(false);
  const loading = ref(false);
  const dirty = ref(false);
  const safeValue = ref(props.value);

  watch(focused, (newFocus) => {
    if (!newFocus && !dirty.value && !error.value) {
      forceSafeValueUpdate();
    }
    if (!newFocus && dirty.value && !(rulesErrors.value && rulesErrors.value.length)) {
      if (hasChangeListener()) loading.value = true;
    }
  });

  watch(dirty, (newDirty) => {
    if (!newDirty && !focused.value && !error.value) {
      forceSafeValueUpdate();
    }
  });

  watch(() => props.value, (newValue) => {
    if (!focused.value && !(rulesErrors.value && rulesErrors.value.length)) {
      safeValue.value = newValue;
    }
  });

  watch(safeValue, () => {
    error.value = false;
    ackErrors.value = null;
  });

  const errors = computed(() => {
    const errs: string[] = ackErrors.value ? [ackErrors.value] : [];
    if (Array.isArray(rulesErrors.value)) {
      errs.push(...rulesErrors.value);
    }
    if (Array.isArray(props.errorMessages)) {
      errs.push(...props.errorMessages);
    } else if (typeof props.errorMessages === 'string' && props.errorMessages) {
      errs.push(props.errorMessages);
    }
    return errs;
  });

  const isDisabled = computed(() => {
    return context.editPermission === false || props.disabled;
  });

  const debounceTime = computed(() => {
    if (Number.isFinite(props.debounce)) {
      return props.debounce as number;
    } else if (Number.isFinite(context.debounceTime)) {
      return context.debounceTime as number;
    } else {
      return 750;
    }
  });

  const debouncedChange = debounce(change, debounceTime.value);

  onBeforeUnmount(() => {
    debouncedChange.flush();
  });

  function input(val: unknown) {
    emit('input', val);
    dirty.value = true;

    rulesErrors.value = null;
    if (props.rules && props.rules.length) {
      props.rules.forEach(rule => {
        const result = rule(val);
        if (typeof result === 'string') {
          if (!rulesErrors.value) rulesErrors.value = [];
          rulesErrors.value.push(result);
        }
      });
    }
    if (rulesErrors.value) {
      return;
    }

    debouncedChange(val);
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

  function change(val: unknown) {
    dirty.value = true;
    if (hasChangeListener()) loading.value = true;
    emit('change', val, acknowledgeChange);
  }

  function hasChangeListener(): boolean {
    return !!(attrs && attrs.onChange);
  }

  function forceSafeValueUpdate() {
    safeValue.value = null;
    nextTick(() => {
      safeValue.value = props.value;
    });
  }

  return {
    error,
    ackErrors,
    rulesErrors,
    focused,
    loading,
    dirty,
    safeValue,
    errors,
    isDisabled,
    debounceTime,
    input,
    acknowledgeChange,
    change,
    hasChangeListener,
    forceSafeValueUpdate,
  };
}
