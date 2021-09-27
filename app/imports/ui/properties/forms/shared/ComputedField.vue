<template lang="html">
  <div class="computed-field">
    <text-field
      :value="model.calculation"
      v-bind="$attrs"
      @change="(value, ack) => $emit('change', {path: ['calculation'], value, ack})"
    />
    <calculation-error-list :errors="model.errors" />
  </div>
</template>

<script>
import CalculationErrorList from '/imports/ui/properties/forms/shared/CalculationErrorList.vue';

export default {
  components: {
    CalculationErrorList,
  },
  props: {
    model: {
      type: Object,
      default: () => {},
    },
  },
}
</script>

<style lang="css" scoped>
</style>
