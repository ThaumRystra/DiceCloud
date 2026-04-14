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
  <div class="container-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          label="Value"
          suffix="gp"
          type="number"
          min="0"
          hint="The value of the item in gold pieces, using decimals for values less than 1 gp"
          class="mx-1"
          style="flex-basis: 300px;"
          prepend-inner-icon="$vuetify.icons.two_coins"
          :value="model.value"
          :error-messages="errors.value"
          @change="change('value', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          label="Weight"
          suffix="lb"
          type="number"
          min="0"
          class="mx-1"
          style="flex-basis: 300px;"
          prepend-inner-icon="$vuetify.icons.weight"
          :value="model.weight"
          :error-messages="errors.weight"
          @change="change('weight', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
      >
        <smart-switch
          label="Carried"
          class="mx-3"
          hint="Whether this container and its contents count towards the creature's weight carried"
          :value="model.carried"
          :error-messages="errors.carried"
          @change="change('carried', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
      >
        <smart-switch
          label="Contents are weightless"
          :value="model.contentsWeightless"
          :error-messages="errors.contentsWeightless"
          @change="change('contentsWeightless', ...arguments)"
        />
      </v-col>
    </v-row>

    <inline-computation-field
      class="mt-4"
      label="Description"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <form-sections
      v-if="$slots.default"
      type="container"
    >
      <slot />
    </form-sections>
  </div>
</template>
