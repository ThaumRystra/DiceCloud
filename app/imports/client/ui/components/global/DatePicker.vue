<script setup lang="ts">
import { ref, computed, useAttrs } from 'vue';
import { useSmartInput } from '/imports/client/ui/components/global/useSmartInput';
import { format } from 'date-fns';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  value?: string | number | Date | unknown[] | object | boolean;
  errorMessages?: string | string[];
  disabled?: boolean;
  debounce?: number;
  rules?: Array<(val: unknown) => string | true>;
}>();

const emit = defineEmits<{
  change: [val: unknown, ack: (err?: unknown) => void];
  input: [val: unknown];
}>();

const attrs = useAttrs();
const { loading, errors, safeValue, isDisabled, focused, input } = useSmartInput(props, emit, attrs);

const menu = ref(false);

const formattedSafeValue = computed(() => {
  if (!safeValue.value) return '';
  return format(safeValue.value as Date, 'yyyy-MM-dd');
});

function dateInput(e: unknown) {
  menu.value = false;
  input(e);
}
</script>

<template lang="html">
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    lazy
    transition="scale-transition"
    full-width
    min-width="290px"
  >
    <template #activator="{ props }">
      <v-text-field
        :model-value="formattedSafeValue"
        v-bind="{...$attrs, ...props}"
        prepend-icon="mdi-calendar"
        readonly
        :loading="loading"
        :error-messages="errors"
        :disabled="isDisabled"
        variant="outlined"
        @focus="focused = true"
        @blur="focused = false"
      />
    </template>
    <v-date-picker
      :value="formattedSafeValue"
      @input="dateInput"
    />
  </v-menu>
</template>

<style lang="css" scoped>

</style>
