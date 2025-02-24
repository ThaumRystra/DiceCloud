<template lang="html">
  <div>
    <v-row dense>
      <v-col cols="12">
        <text-field
          :label="$t('AttributeForm.vWQj52YzUPPcXSMEZ6dvh')"
          :value="model.variableName"
          style="flex-basis: 300px;"
          :hint="$t('AttributeForm.5vD-GDW3cW8IXJrzxwTo_')"
          :error-messages="errors.variableName"
          @change="change('variableName', ...arguments)"
        />
      </v-col>
      <v-col cols="12">
        <text-field
          :label="$t('ConstantForm.aEv2NC1UXKBC9Z63kT9Jb')"
          :hint="$t('ConstantForm.GTcn_A5mZ3nBpC96UMZye')"
          :value="model.calculation"
          :error-messages="errors.calculation"
          @change="change('calculation', ...arguments)"
        />
        <calculation-error-list :errors="clientErrors" />
      </v-col>
    </v-row>
    <form-sections
      v-if="$slots.default"
      type="constant"
    >
      <slot />
    </form-sections>
  </div>
</template>

<script lang="js">
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';
import CalculationErrorList from '/imports/client/ui/properties/forms/shared/CalculationErrorList.vue';
import { ConstantSchema } from '/imports/api/properties/Constants';

export default {
  components: {
    CalculationErrorList,
  },
  mixins: [propertyFormMixin],
  computed: {
    // We can't rely on autoValue running in every form, so recalculate errors
    clientErrors(){
      let cleanModel = ConstantSchema.clean(this.model);
      return cleanModel.errors;
    }
  }
}
</script>

<style lang="css" scoped>
</style>
