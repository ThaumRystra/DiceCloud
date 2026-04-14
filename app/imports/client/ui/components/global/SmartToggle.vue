<script setup lang="ts">
import { ref, useAttrs } from 'vue';
import { useSmartInput } from '/imports/client/ui/components/global/useSmartInput';
import OutlinedInput from '/imports/client/ui/properties/viewers/shared/OutlinedInput.vue';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  value?: string | number | Date | unknown[] | object | boolean;
  errorMessages?: string | string[];
  disabled?: boolean;
  debounce?: number;
  rules?: Array<(val: unknown) => string | true>;
  label?: string;
  options?: Array<{ value: unknown; name: string; icon?: string }>;
}>();

const emit = defineEmits<{
  change: [val: unknown, ack: (err?: unknown) => void];
  input: [val: unknown];
}>();

const attrs = useAttrs();
const { loading, errors, safeValue, isDisabled, change } = useSmartInput(props, emit, attrs);

const clickedValue = ref<unknown>(undefined);

function click(val: unknown) {
  clickedValue.value = val;
  change(val);
}
</script>

<template lang="html">
  <outlined-input
    :name="label"
    class="mb-6 pt-1"
  >
    <v-btn-toggle
      v-bind="$attrs"
      mandatory
      rounded="0"
      group
      :model-value="safeValue"
      color="accent"
      style="flex-wrap: wrap;"
    >
      <v-btn
        v-for="(option, i) in options"
        :key="`toggle-option-${i}`"
        :value="option.value"
        :disabled="isDisabled || (clickedValue != option.value && loading)"
        :variant="clickedValue != option.value && loading ? 'plain' : undefined"
        :loading="clickedValue == option.value && loading"
        height="42"
        v-on="(value == option.value) ? {} : { click() { click(option.value) } }"
      >
        <v-icon
          v-if="option.icon"
          start
        >
          {{ option.icon }}
        </v-icon>
        {{ option.name }}
      </v-btn>
    </v-btn-toggle>
    <v-expand-transition>
      <div
        v-if="errors.length"
        class="pa-2 text-error"
      >
        {{ errors.join('\n\n') }}
      </div>
    </v-expand-transition>
  </outlined-input>
</template>
