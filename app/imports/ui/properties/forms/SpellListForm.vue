<template lang="html">
  <div class="attribute-form">
    <div class="layout wrap">
      <text-field
        ref="focusFirst"
        label="Name"
        :value="model.name"
        :error-messages="errors.name"
        @change="change('name', ...arguments)"
      />
    </div>

    <text-area
      label="Description"
      :value="model.description"
      :error-messages="errors.description"
      @change="change('description', ...arguments)"
    />
    <calculation-error-list :calculations="model.descriptionCalculations" />

    <text-field
      label="Maximum prepared spells"
      :value="model.maxPrepared"
      hint="How many spells can be prepared"
      :error-messages="errors.maxPrepared"
      @change="change('maxPrepared', ...arguments)"
    />
    <calculation-error-list :errors="model.maxPreparedErrors" />

    <text-field
      label="Spell save DC"
      :value="model.dc"
      hint="The spell save DC of spells in this list"
      :error-messages="errors.dc"
      @change="change('dc', ...arguments)"
    />
    <calculation-error-list :errors="model.dcErrors" />

    <text-field
      label="Attack roll bonus"
      :value="model.attackRollBonus"
      hint="The attack roll bonus of spell attacks made by spells in this list"
      :error-messages="errors.attackRollBonus"
      @change="change('attackRollBonus', ...arguments)"
    />
    <calculation-error-list :errors="model.attackRollBonusErrors" />

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
};
</script>

<style lang="css" scoped>
</style>
