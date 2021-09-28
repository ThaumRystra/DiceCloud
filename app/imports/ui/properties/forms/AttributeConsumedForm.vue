<template lang="html">
  <div class="layout">
    <smart-combobox
      label="Attribute"
      hint="The attribute variable name that will be consumed"
      style="flex-basis: 300px;"
      :items="attributeList"
      :value="model.variableName"
      :error-messages="errors.variableName"
      @change="change('variableName', ...arguments)"
    />
    <computed-field
      label="Quantity"
      hint="How much of the attribute will be consumed. If this amount is not available in the attribute, the action can't be taken"
      :model="model.quantity"
      :error-messages="errors.quantity"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['quantity', ...path], value, ack})"
    />
  </div>
</template>

<script lang="js">
import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';
import attributeListMixin from '/imports/ui/properties/forms/shared/lists/attributeListMixin.js';

export default {
  mixins: [propertyFormMixin, attributeListMixin],
}
</script>
