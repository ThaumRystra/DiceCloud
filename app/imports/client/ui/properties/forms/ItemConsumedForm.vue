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

<script lang="js">
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';

export default {
  mixins: [propertyFormMixin],
};
</script>
