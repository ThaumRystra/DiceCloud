<template lang="html">
  <div>
    <v-row dense>
      <v-col cols="12">
        <text-field
          label="Variable name"
          :value="model.variableName"
          style="flex-basis: 300px;"
          hint="Use this name in calculations to reference this attribute"
          :error-messages="errors.variableName"
          @change="change('variableName', ...arguments)"
        />
      </v-col>
      <v-col cols="12">
        <text-field
          label="Value"
          hint="Calculation of the constant value, use 'text' for a string value, [1,2,3] for a matrix, or 123 for a number"
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

<script setup lang="ts">
import { computed } from 'vue';
import { ConstantSchema } from '/imports/api/properties/Constants';

const props = withDefaults(defineProps<{
  model: Record<string, any>;
  errors?: Record<string, string>;
}>(), {
  errors: () => ({}),
});

const emit = defineEmits(['change']);

function change(path: string | string[], value: any, ack?: Function) {
  const pathArray = Array.isArray(path) ? path : [path];
  emit('change', { path: pathArray, value, ack });
}

// We can't rely on autoValue running in every form, so recalculate errors
const clientErrors = computed(() => {
  const cleanModel = ConstantSchema.clean(props.model);
  return cleanModel.errors;
});
</script>

<style lang="css" scoped>
</style>
