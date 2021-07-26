<template lang="html">
  <div class="feature-form">
    <text-field
      ref="focusFirst"
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      @change="change('name', ...arguments)"
    />

    <text-area
      label="Summary"
      hint="This will appear in the card in the character sheet"
      :value="model.summary"
      :error-messages="errors.summary"
      @change="change('summary', ...arguments)"
    />
    <calculation-error-list :calculations="model.summaryCalculations" />

    <text-area
      label="Description"
      hint="Text that does not fit in the summary"
      :value="model.description"
      :error-messages="errors.description"
      @change="change('description', ...arguments)"
    />
    <calculation-error-list :calculations="model.descriptionCalculations" />

    <smart-combobox
      label="Tags"
      multiple
      chips
      deletable-chips
      hint="Used to let slots find this property in a library, should otherwise be left blank"
      :value="model.tags"
      @change="change('tags', ...arguments)"
    />
  </div>
</template>

<script lang="js">
import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';
import CalculationErrorList from '/imports/ui/properties/forms/shared/CalculationErrorList.vue';

export default {
  components: {
    CalculationErrorList,
  },
  mixins: [propertyFormMixin],
}
</script>
