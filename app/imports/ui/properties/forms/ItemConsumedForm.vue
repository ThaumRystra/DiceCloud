<template lang="html">
  <div class="layout">
    <text-field
      label="Item"
      hint="The item tag that will be consumed"
      style="flex-basis: 300px;"
      :value="model.tag"
      :error-messages="errors.tag"
      @change="change('tag', ...arguments)"
    />
    <computed-field
      label="Quantity"
      hint="How many will be consumed"
      style="flex-basis: 300px;"
      :model="model.quantity"
      :error-messages="errors.quantity"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['quantity', ...path], value, ack})"
    />
  </div>
</template>

<script lang="js">
import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';

export default {
  mixins: [propertyFormMixin],
};
</script>
