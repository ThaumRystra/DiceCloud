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
        {{ model.value }}
      </template>
    </text-field>
    <calculation-error-list :errors="errorList" />
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
    hideValue: {
      type: Boolean,
    },
  },
  computed: {
    showValue() {
      const value = this.model.value;
      if (
        this.hideValue || 
        (value === undefined || value === null) ||
        value == this.model.calculation
      ) return false;
      return true;
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
