<template lang="html">
  <div class="spell-form">
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
      :items="slotTypes"
      :value="model.slotType"
      :error-messages="errors.slotType"
      @change="change('slotType', ...arguments)"
    />
    <smart-combobox
      label="Tags"
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
      min="1"
      hint="How many matching properties must be used to fill this slot"
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
      <text-field
        label="Quantity filled"
        type="number"
        min="0"
        hint="How many properties have already been selected to fill this slot"
        :value="model.quantityFilled"
        :error-messages="errors.quantityFilled"
        @change="change('quantityFilled', ...arguments)"
      />
      <div class="layout row wrap justify-space-between">
        <smart-switch
          label="Ignored"
          style="width: 200px; flex-grow: 0;"
          class="mx-2"
          :value="model.ignored"
          :error-messages="errors.ignored"
          @change="change('ignored', ...arguments)"
        />
      </div>
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
