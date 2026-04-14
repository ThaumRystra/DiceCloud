<script setup lang="ts">
withDefaults(defineProps<{
  model: Record<string, any>;
  errors?: Record<string, string>;
}>(), { errors: () => ({}) });

const emit = defineEmits(['change']);

function change(path: string | string[], value: any, ack?: Function) {
  const pathArray = Array.isArray(path) ? path : [path];
  emit('change', { path: pathArray, value, ack });
}
</script>

<template lang="html">
  <v-row dense>
    <v-col
      cols="12"
      md="6"
    >
      <text-field
        label="Item"
        hint="The item tag that will be consumed"
        style="flex-basis: 300px;"
        :value="model.tag"
        :error-messages="errors.tag"
        @change="change('tag', ...arguments)"
      />
    </v-col>
    <v-col
      cols="12"
      md="6"
    >
      <computed-field
        label="Quantity"
        hint="How many will be consumed"
        style="flex-basis: 300px;"
        :model="model.quantity"
        :error-messages="errors.quantity"
        @change="({path, value, ack}) =>
          $emit('change', {path: ['quantity', ...path], value, ack})"
      />
    </v-col>
  </v-row>
</template>
