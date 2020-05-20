<template lang="html">
  <div class="skill-form">
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
        hint="Use this name in formulae to reference this skill"
        :error-messages="errors.variableName"
        @change="change('variableName', ...arguments)"
      />
      <smart-combobox
        label="Ability"
        :value="model.ability"
        style="flex-basis: 300px;"
        hint="Which ability is this skill based off of"
        :items="abilityScoreList"
        :error-messages="errors.ability"
        @change="change('ability', ...arguments)"
      />
    </div>
    <smart-select
      label="Type"
      :items="skillTypes"
      :value="model.skillType"
      :error-messages="errors.skillType"
      :menu-props="{auto: true, lazy: true}"
      @change="change('skillType', ...arguments)"
    />
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
      <div class="layout row justify-center">
        <text-field
          label="Base Value"
          type="number"
          class="base-value-field text-xs-center large-format no-flex"
          :value="model.baseValue"
          hint="This is the value of the skill before effects are applied"
          :error-messages="errors.baseValue"
          @change="change('baseValue', ...arguments)"
        />
        <proficiency-select
          style="flex-basis: 300px;"
          label="Base Proficiency"
          :value="model.baseProficiency"
          :error-messages="errors.baseProficiency"
          @change="change('baseProficiency', ...arguments)"
        />
      </div>
    </form-section>
  </div>
</template>

<script>
	import ProficiencySelect from '/imports/ui/properties/forms/shared/ProficiencySelect.vue';
	import FormSection from '/imports/ui/properties/forms/shared/FormSection.vue';
  import createListOfProperties from '/imports/ui/properties/forms/shared/lists/createListOfProperties.js';
  import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';

	export default {
		components: {
			ProficiencySelect,
			FormSection,
		},
    mixins: [propertyFormMixin],
		data(){return{
			skillTypes: [
				{
					text: 'Skill',
					value: 'skill',
				}, {
					text: 'Save',
					value: 'save',
				}, {
					text: 'Check',
					value: 'check',
				}, {
					text: 'Tool',
					value: 'tool',
				}, {
					text: 'Weapon',
					value: 'weapon',
				}, {
					text: 'Armor',
					value: 'armor',
				}, {
					text: 'Language',
					value: 'language',
				}, {
					text: 'Utility',
					value: 'utility',
				},
			]
		};},
    meteor: {
      abilityScoreList(){
        return createListOfProperties({
          type: 'attribute',
          attributeType: 'ability',
        });
      },
    },
	};
</script>

<style lang="css" scoped>
</style>
