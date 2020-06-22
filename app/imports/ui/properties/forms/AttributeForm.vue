<template lang="html">
  <div class="attribute-form">
    <div class="layout column align-center">
      <text-field
        ref="focusFirst"
        label="Base Value"
        class="base-value-field"
        hint="This is the value of the attribute before effects are applied"
        style="width: 332px;"
        :value="model.baseValueCalculation"
        :error-messages="errors.baseValueCalculation"
        @change="change('baseValueCalculation', ...arguments)"
      />
    </div>
    <calculation-error-list :errors="model.baseValueErrors" />
    <div class="layout row wrap">
      <text-field
        label="Name"
        :value="model.name"
        :error-messages="errors.name"
        @change="change('name', ...arguments)"
      />
      <text-field
        label="Variable name"
        :value="model.variableName"
        style="flex-basis: 300px;"
        hint="Use this name in formulae to reference this attribute"
        :error-messages="errors.variableName"
        @change="change('variableName', ...arguments)"
      />
    </div>
    <smart-select
      label="Type"
      :items="attributeTypes"
      :value="model.attributeType"
      :error-messages="errors.attributeType"
      :menu-props="{auto: true, lazy: true}"
      :hint="attributeTypeHints[model.attributeType]"
      @change="change('attributeType', ...arguments)"
    />
    <smart-select
      v-if="model.attributeType === 'hitDice'"
      label="Hit Dice Size"
      :items="['d4', 'd6', 'd8', 'd10', 'd12', 'd20']"
      :value="model.hitDiceSize"
      :error-messages="errors.hitDiceSize"
      :menu-props="{auto: true, lazy: true}"
      @change="change('hitDiceSize', ...arguments)"
    />
    <text-field
      v-if="model.attributeType === 'spellSlot'"
      label="Spell slot level"
      :value="model.spellSlotLevelCalculation"
      :error-messages="errors.spellSlotLevelCalculation"
      @change="change('spellSlotLevelCalculation', ...arguments)"
    />
    <calculation-error-list :errors="model.spellSlotLevelErrors" />
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
      <div class="layout column align-center">
        <smart-switch
          v-if="model.attributeType !== 'hitDice'"
          label="Allow decimal values"
          class="no-flex"
          :value="model.decimal"
          :error-messages="errors.decimal"
          @change="change('decimal', ...arguments)"
        />
        <div
          class="layout row justify-center"
          style="align-self: stretch;"
        >
          <text-field
            label="Damage"
            type="number"
            class="damage-field text-xs-center"
            style="max-width: 300px;"
            hint="The attribute's final value is reduced by this amount"
            :value="model.damage"
            :error-messages="errors.damage"
            @change="change('damage', ...arguments)"
          />
        </div>
      </div>
      <div class="layout row wrap">
        <smart-select
          v-if="model.attributeType !== 'hitDice'"
          label="Reset"
          clearable
          style="flex-basis: 300px;"
          :items="resetOptions"
          :value="model.reset"
          :error-messages="errors.reset"
          :menu-props="{auto: true, lazy: true}"
          @change="change('reset', ...arguments)"
        />
      </div>
    </form-section>
  </div>
</template>

<script>
	import FormSection from '/imports/ui/properties/forms/shared/FormSection.vue';
  import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';
  import CalculationErrorList from '/imports/ui/properties/forms/shared/CalculationErrorList.vue';

	export default {
		components: {
			FormSection,
      CalculationErrorList,
		},
    mixins: [propertyFormMixin],
		data(){
			let data = {
				attributeTypes: [
					{
						text: 'Ability score',
						value: 'ability',
						help: 'Ability scores are your primary attributes, like Strength and Intelligence',
					}, {
						text: 'Stat',
						value: 'stat',
						help: 'Stats are attributes with a numerical value like speed or carrying capacity',
					}, {
						text: 'Modifier',
						value: 'modifier',
						help: 'Modifiers are attributes that are added to rolls, like proficiency bonus',
					}, {
						text: 'Hit dice',
						value: 'hitDice',
					}, {
						text: 'Health bar',
						value: 'healthBar',
					}, {
						text: 'Resource',
						value: 'resource',
						help: 'Resources are attributes that are spent to fuel actions, like sorcery points or ki'
					}, {
						text: 'Spell slot',
						value: 'spellSlot',
					}, {
						text: 'Utility',
						value: 'utility',
						help: 'Utility attributes aren\'t displayed on your character sheet, but can be referenced or used in calculations',
					},
				],
				resetOptions: [
					{
						text: 'Short rest',
						value: 'shortRest',
					}, {
						text: 'Long rest',
						value: 'longRest',
					}
				],
			};
			data.attributeTypeHints = {};
			data.attributeTypes.forEach(type => {
				data.attributeTypeHints[type.value] = type.help;
			});
			return data;
		},
    watch: {
      'model.attributeType': function(newVal, oldVal){
        if (newVal === 'hitDice' && !this.model.hitDiceSize){
          this.$emit('change', {path: ['hitDiceSize'], value: 'd8'});
        } else if (oldVal === 'hitDice'){
          this.$emit('change', {path: ['hitDiceSize'], value: undefined});
        }
      },
    },
	};
</script>

<style lang="css" scoped>
	.no-flex {
		flex: initial;
	}
	.layout.row.wrap {
		margin-right: -8px;
	}
	.layout.row.wrap > *{
		margin-right: 8px;
	}
</style>
