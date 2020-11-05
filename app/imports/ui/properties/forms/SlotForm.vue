<template lang="html">
  <div class="slot-form">
    <text-field
      ref="focusFirst"
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      @change="change('name', ...arguments)"
    />
    <smart-select
      label="Type"
      style="flex-basis: 300px;"
      clearable
      :items="slotTypes"
      :value="model.slotType"
      :error-messages="errors.slotType"
      @change="change('slotType', ...arguments)"
    />
    <smart-combobox
      label="Tags Required"
      hint="The slot must be filled with a property which has all the listed tags"
      multiple
      chips
      deletable-chips
      :value="model.slotTags"
      :error-messages="errors.slotTags"
      @change="change('slotTags', ...arguments)"
    />
    <text-field
      label="Quantity"
      type="number"
      min="0"
      hint="How many matching properties must be used to fill this slot, 0 is unlimited"
      :value="model.quantityExpected"
      :error-messages="errors.quantityExpected"
      @change="change('quantityExpected', ...arguments)"
    />
    <text-field
      label="Condition"
      hint="A caclulation to determine if this slot should be active"
      placeholder="Always active"
      :value="model.slotCondition"
      :error-messages="errors.slotCondition"
      @change="change('slotCondition', ...arguments)"
    />
    <calculation-error-list :errors="model.slotConditionErrors" />
    <text-area
      label="Description"
      :value="model.description"
      :error-messages="errors.description"
      @change="change('description', ...arguments)"
    />
    <form-section
      name="Advanced"
      standalone
    >
      <div class="layout row wrap justify-space-between">
        <smart-switch
          label="Hide when full"
          style="width: 200px; flex-grow: 0;"
          class="mx-2"
          :value="model.hideWhenFull"
          :error-messages="errors.hideWhenFull"
          @change="change('hideWhenFull', ...arguments)"
        />
        <smart-switch
          label="Ignored"
          style="width: 200px; flex-grow: 0;"
          class="mx-2"
          :value="model.ignored"
          :error-messages="errors.ignored"
          @change="change('ignored', ...arguments)"
        />
      </div>
      <smart-combobox
        label="Tags"
        multiple
        chips
        deletable-chips
        :value="model.tags"
        @change="change('tags', ...arguments)"
      />
    </form-section>
  </div>
</template>

<script>
  import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';
  import FormSection from '/imports/ui/properties/forms/shared/FormSection.vue';
  import CalculationErrorList from '/imports/ui/properties/forms/shared/CalculationErrorList.vue';
  import PROPERTIES from '/imports/constants/PROPERTIES.js';

	export default {
    components: {
			FormSection,
      CalculationErrorList,
		},
    mixins: [propertyFormMixin],
    data(){
      let slotTypes = [];
      for (let key in PROPERTIES){
         slotTypes.push({text: PROPERTIES[key].name, value: key});
      }
      return {slotTypes};
    },
	};
</script>
