<template lang="html">
  <div>
    <div class="layout row wrap">
      <text-field
        label="Name"
        :value="model.name"
        :error-messages="errors.name"
        @change="change('name', ...arguments)"
      />
      <text-field
        label="Variable name"
        :value="model.variableName"
        style="flex-basis: 300px;"
        hint="Use this name in formulae to reference this attribute"
        :error-messages="errors.variableName"
        @change="change('variableName', ...arguments)"
      />
    </div>
    <text-field
      label="Value"
      :value="model.calculation"
      :error-messages="errors.calculation"
      @change="change('calculation', ...arguments)"
    />
    <calculation-error-list :errors="clientErrors" />
  </div>
</template>

<script>
import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';
import CalculationErrorList from '/imports/ui/properties/forms/shared/CalculationErrorList.vue';
import { ConstantSchema } from '/imports/api/properties/Constants.js';

export default {
  components: {
    CalculationErrorList,
  },
  mixins: [propertyFormMixin],
  computed: {
    // We can't rely on autoValue running in every form, so recalculate errors
    clientErrors(){
      let validationContext = ConstantSchema.newContext();
      let cleanModel = validationContext.clean(this.model);
      return cleanModel.errors;
    }
  }
}
</script>

<style lang="css" scoped>
</style>
