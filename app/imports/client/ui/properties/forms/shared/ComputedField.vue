<template lang="html">
  <div class="computed-field">
    <text-field
      :value="model.calculation"
      v-bind="$attrs"
      @change="(value, ack) => $emit('change', {path: ['calculation'], value, ack})"
    >
      <template
        v-if="showValue"
        #value
      >
        {{ displayedValue }}
      </template>
      <template #prepend>
        <slot name="prepend" />
      </template>
    </text-field>
    <calculation-error-list :errors="errorList" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  model?: Record<string, any>;
  hideValue?: boolean;
}>(), {
  model: () => ({}),
  hideValue: false,
});

const displayedValue = computed(() => {
  if (props.model.unaffected !== undefined) {
    return props.model.unaffected;
  }
  return props.model.value;
});

const showValue = computed(() => {
  const value = displayedValue.value;
  if (
    props.hideValue ||
    value === undefined || value === null ||
    value == props.model.calculation
  ) return false;
  return true;
});

const errorList = computed(() => {
  if (props.model.parseError) {
    return [props.model.parseError, ...props.model.errors];
  } else {
    return props.model.errors;
  }
});
</script>

<style lang="css" scoped>
</style>
