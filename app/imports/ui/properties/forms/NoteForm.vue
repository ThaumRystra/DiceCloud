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
      hint="This will appear in the action card in the character sheet"
      :value="model.summary"
      :error-messages="errors.summary"
      @change="change('summary', ...arguments)"
    />
    <calculation-error-list :calculations="model.summaryCalculations" />
    
    <text-area
      label="Description"
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
      :value="model.tags"
      @change="change('tags', ...arguments)"
    />
  </div>
</template>

<script>
import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';

export default {
  mixins: [propertyFormMixin],
}
</script>
