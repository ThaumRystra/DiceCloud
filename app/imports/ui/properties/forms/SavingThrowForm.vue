<template lang="html">
  <div class="saving-throw-form">
    <text-field
      label="DC"
      :value="model.dc"
      :error-messages="errors.dc"
      @change="change('dc', ...arguments)"
    />
    <smart-combobox
      label="Save"
      hint="Which save the saving throw targets"
      :value="model.ability"
      :items="saveList"
      :error-messages="errors.ability"
      @change="change('ability', ...arguments)"
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
