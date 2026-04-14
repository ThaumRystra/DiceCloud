<script setup lang="ts">
import { autorun } from 'vue-meteor-tracker';
import createListOfProperties from '/imports/client/ui/properties/forms/shared/lists/createListOfProperties';

withDefaults(defineProps<{
  model: Record<string, any>;
  errors?: Record<string, string>;
}>(), { errors: () => ({}) });

const emit = defineEmits(['change']);

function change(path: string | string[], value: any, ack?: Function) {
  const pathArray = Array.isArray(path) ? path : [path];
  emit('change', { path: pathArray, value, ack });
}

const { result: attributeList } = autorun(() =>
  createListOfProperties({ type: { $in: ['attribute', 'skill'] } })
);
</script>

<template lang="html">
  <v-row dense>
    <v-col
      cols="12"
      md="6"
    >
      <smart-combobox
        label="Attribute"
        hint="The attribute variable name that will be consumed"
        style="flex-basis: 300px;"
        :items="attributeList"
        :value="model.variableName"
        :error-messages="errors.variableName"
        @change="change('variableName', ...arguments)"
      />
    </v-col>
    <v-col
      cols="12"
      md="6"
    >
      <computed-field
        label="Quantity"
        hint="How much of the attribute will be consumed. If this amount is not available in the attribute, the action can't be taken"
        :model="model.quantity"
        :error-messages="errors.quantity"
        @change="({path, value, ack}) =>
          $emit('change', {path: ['quantity', ...path], value, ack})"
      />
    </v-col>
  </v-row>
</template>
