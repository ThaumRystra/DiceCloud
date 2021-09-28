<template lang="html">
  <div class="inline-computation-field">
    <text-area
      :value="model.text"
      v-bind="$attrs"
      @change="(value, ack) => $emit('change', {path: ['text'], value, ack})"
    />
    <template v-for="calc in model.inlineCalculations">
      <div
        v-if="calc && calc.calculation && calc.errors.length"
        :key="calc.calculation"
      >
        <v-subheader
          class="warning--text"
          style="font-family: monospace;"
        >
          { {{ calc.calculation }} }
        </v-subheader>
        <calculation-error-list :errors="calc.errors" />
      </div>
    </template>
  </div>
</template>

<script lang="js">
import CalculationErrorList from '/imports/ui/properties/forms/shared/CalculationErrorList.vue';

export default {
  components: {
    CalculationErrorList,
  },
  props: {
    model: {
      type: Object,
      default: () => ({}),
    },
  },
}
</script>

<style lang="css" scoped>
</style>
