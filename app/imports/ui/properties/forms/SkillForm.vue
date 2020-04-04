<template lang="html">
  <div class="skill-form">
    <div class="layout row wrap">
      <text-field
        label="Name"
        :value="model.name"
        :error-messages="errors.name"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
      />
      <text-field
        label="Variable name"
        :value="model.variableName"
        style="flex-basis: 300px;"
        hint="Use this name in formulae to reference this skill"
        :error-messages="errors.variableName"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['variableName'], value, ack})"
      />
      <text-field
        label="Ability"
        :value="model.ability"
        style="flex-basis: 300px;"
        hint="Which ability is this skill based off of"
        :error-messages="errors.ability"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['ability'], value, ack})"
      />
    </div>
    <smart-select
      label="Type"
      :items="skillTypes"
      :value="model.skillType"
      :error-messages="errors.skillType"
      :menu-props="{auto: true, lazy: true}"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['skillType'], value, ack})"
    />
    <text-area
      label="Description"
      :value="model.description"
      :error-messages="errors.description"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['description'], value, ack})"
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
          :debounce-time="debounceTime"
          @change="(value, ack) => $emit('change', {path: ['baseValue'], value, ack})"
        />
        <proficiency-select
          style="flex-basis: 300px;"
          label="Base Proficiency"
          clearable
          :value="model.baseProficiency"
          :error-messages="errors.baseProficiency"
          @change="(value, ack) => {$emit('change', {path: ['baseProficiency'], value: value || '', ack}); log({value, ack})}"
        />
      </div>
    </form-section>
  </div>
</template>

<script>
	import ProficiencySelect from '/imports/ui/properties/forms/shared/ProficiencySelect.vue';
	import FormSection from '/imports/ui/properties/forms/shared/FormSection.vue';

	export default {
		components: {
			ProficiencySelect,
			FormSection,
		},
		props: {
			model: {
				type: Object,
				default: () => ({}),
			},
			errors: {
				type: Object,
				default: () => ({}),
			},
      debounceTime: {
        type: Number,
        default: undefined,
      },
		},
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
					text: 'Language',
					value: 'language',
				}, {
					text: 'Utility',
					value: 'utility',
				},
			]
		};},
		methods: {
			log: console.log,
		},
	};
</script>

<style lang="css" scoped>
</style>
