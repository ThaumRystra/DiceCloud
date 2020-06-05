<template lang="html">
  <div class="saving-throw-form">
    <text-field
      ref="focusFirst"
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      @change="change('name', ...arguments)"
    />
    <text-field
      label="DC"
      :value="model.dc"
      :error-messages="errors.dc"
      @change="change('dc', ...arguments)"
    />
    <smart-combobox
      label="Save"
      hint="Which save the saving throw targets"
      :value="model.stat"
      :items="saveList"
      :error-messages="errors.stat"
      @change="change('stat', ...arguments)"
    />
  </div>
</template>

<script>
import saveListMixin from '/imports/ui/properties/forms/shared/lists/saveListMixin.js';
import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';

export default {
  mixins: [saveListMixin, propertyFormMixin],
};
</script>
