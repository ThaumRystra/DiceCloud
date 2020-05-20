<template lang="html">
  <div class="layout row">
    <text-field
      label="Item"
      hint="The item tag that will be consumed"
      style="flex-basis: 300px;"
      :value="model.tag"
      :error-messages="errors.tag"
      @change="change('tag', ...arguments)"
    />
    <text-field
      label="Quantity"
      hint="How much of the item will be consumed"
      style="flex-basis: 300px;"
      :value="model.quantity"
      :error-messages="errors.quantity"
      @change="change('quantity', ...arguments)"
    />
  </div>
</template>

<script>
import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';

export default {
  mixins: [propertyFormMixin],
};
</script>
