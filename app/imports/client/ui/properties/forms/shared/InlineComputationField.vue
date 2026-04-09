<template lang="html">
  <div class="inline-computation-field">
    <text-area
      :value="model.text"
      v-bind="$attrs"
      @change="(value, ack) => $emit('change', {path: ['text'], value, ack})"
    />
    <template v-for="calc in model.inlineCalculations">
      <div
        v-if="calc && calc.calculation && (
          (calc.errors && calc.errors.length) || calc.parseError
        )"
        :key="calc.calculation"
        class="mb-4"
      >
        <div
          class="text-warning mb-2 ml-4"
          style="font-family: monospace;"
        >
          { {{ calc.calculation }} }
        </div>
        <calculation-error-list
          v-if="calc.parseError"
          :errors="[calc.parseError]"
        />
        <calculation-error-list
          v-if="calc.errors && calc.errors.length"
          :errors="calc.errors"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  model?: Record<string, any>;
}>(), {
  model: () => ({}),
});
</script>

<style lang="css" scoped>
</style>
