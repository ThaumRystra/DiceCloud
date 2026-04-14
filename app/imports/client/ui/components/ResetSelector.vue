<script setup lang="ts">
import { autorun } from 'vue-meteor-tracker';
import createListOfProperties from '/imports/client/ui/properties/forms/shared/lists/createListOfProperties';

defineProps<{
  value?: string | number | Date | unknown[] | object | boolean;
  errorMessages?: string | string[];
  hint?: string;
}>();

defineEmits<{
  change: [value: unknown, ack: unknown];
}>();

const { result: resetOptions } = autorun(() => {
  const eventActions = createListOfProperties({
    type: 'action',
    actionType: 'event',
  }, true);
  const defaultEvents = [
    { text: 'Short rest', value: 'shortRest' },
    { text: 'Long rest', value: 'longRest' },
  ];
  return [...defaultEvents, ...eventActions];
});
</script>

<template>
  <smart-select
    label="Reset"
    clearable
    style="flex-basis: 300px;"
    :hint="hint"
    :items="resetOptions"
    :value="value"
    :error-messages="errorMessages"
    :menu-props="{auto: true, lazy: true}"
    @change="(value, ack) => $emit('change', value, ack)"
  />
</template>
