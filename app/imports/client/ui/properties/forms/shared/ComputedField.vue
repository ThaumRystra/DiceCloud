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

<script lang="js">
import CalculationErrorList from '/imports/client/ui/properties/forms/shared/CalculationErrorList.vue';

export default {
  components: {
    CalculationErrorList,
  },
  props: {
    model: {
      type: Object,
      default: () => ({}),
    },
    hideValue: {
      type: Boolean,
    },
  },
  computed: {
    showValue() {
      let value = this.displayedValue;
      if (
        this.hideValue || 
        (value === undefined || value === null) ||
        value == this.model.calculation
      ) return false;
      return true;
    },
    displayedValue() {
      let value = this.model.value;
      // Use the base value instead if the calculation has it, because effects can modify the value
      if (this.model.baseValue !== undefined) {
        value = this.model.baseValue;
      }
      return value;
    },
    errorList(){
      if (this.model.parseError){
        return [this.model.parseError, ...this.model.errors];
      } else {
        return this.model.errors;
      }
    }
  }
}
</script>

<style lang="css" scoped>
</style>
