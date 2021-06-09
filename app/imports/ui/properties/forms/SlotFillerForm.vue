<template lang="html">
  <div class="slot-filler-form">
    <div class="layout column align-center">
      <icon-picker
        label="Icon"
        :value="model.icon"
        :error-messages="errors.icon"
        @change="change('icon', ...arguments)"
      />
    </div>
    <text-field
      ref="focusFirst"
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      @change="change('name', ...arguments)"
    />

    <text-area
      label="Description"
      :value="model.description"
      :error-messages="errors.description"
      @change="change('description', ...arguments)"
    />
    <calculation-error-list :calculations="model.descriptionCalculations" />

    <text-field
      label="Picture URL"
      hint="A link to an image representing this property"
      :value="model.picture"
      :error-messages="errors.picture"
      @change="change('picture', ...arguments)"
    />
    <smart-select
      label="Type"
      style="flex-basis: 300px;"
      clearable
      :items="slotTypes"
      :value="model.slotFillerType"
      :error-messages="errors.slotFillerType"
      @change="change('slotFillerType', ...arguments)"
    />
    <text-field
      label="Quantity"
      type="number"
      min="0"
      hint="How many properties this counts as when filling a slot"
      :value="model.slotQuantityFilled"
      :error-messages="errors.slotQuantityFilled"
      @change="change('slotQuantityFilled', ...arguments)"
    />
    <text-field
      label="Condition"
      hint="A caclulation to determine if this can be added to the character"
      placeholder="Always active"
      :value="model.slotFillerCondition"
      :error-messages="errors.slotFillerCondition"
      @change="change('slotFillerCondition', ...arguments)"
    />
    <smart-combobox
      label="Tags"
      multiple
      chips
      deletable-chips
      :value="model.tags"
      :error-messages="errors.tags"
      @change="change('tags', ...arguments)"
    />
  </div>
</template>

<script lang="js">
  import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';
  import PROPERTIES from '/imports/constants/PROPERTIES.js';
  import CalculationErrorList from '/imports/ui/properties/forms/shared/CalculationErrorList.vue';

	export default {
    components: {
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
