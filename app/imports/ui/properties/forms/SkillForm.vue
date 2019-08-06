<template lang="html">
  <div class="skill-form">
		<div class="layout row wrap">
			<text-field
				label="Name"
				:value="model.name"
				@change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
				:error-messages="errors.name"
				:debounce-time="debounceTime"
			/>
			<text-field
				label="Variable name"
				:value="model.variableName"
				style="flex-basis: 300px;"
				@change="(value, ack) => $emit('change', {path: ['variableName'], value, ack})"
				hint="Use this name in formulae to reference this skill"
				:error-messages="errors.variableName"
				:debounce-time="debounceTime"
			/>
			<text-field
				label="Ability"
				:value="model.ability"
				style="flex-basis: 300px;"
				@change="(value, ack) => $emit('change', {path: ['ability'], value, ack})"
				hint="Which ability is this skill based off of"
				:error-messages="errors.ability"
				:debounce-time="debounceTime"
			/>
		</div>
		<smart-select
			label="Type"
			:items="skillTypes"
			:value="model.skillType"
			:error-messages="errors.skillType"
			:menu-props="{auto: true, lazy: true}"
			@change="(value, ack) => $emit('change', {path: ['skillType'], value, ack})"
			:debounce-time="debounceTime"
		/>
		<text-area
			label="Description"
			:value="model.description"
			:error-messages="errors.description"
			@change="(value, ack) => $emit('change', {path: ['description'], value, ack})"
			:debounce-time="debounceTime"
		/>
		<form-section name="Advanced" standalone>
			<div class="layout row justify-center">
				<text-field
					label="Base Value"
					type="number"
					class="base-value-field text-xs-center large-format no-flex"
					:value="model.baseValue"
					@change="(value, ack) => $emit('change', {path: ['baseValue'], value, ack})"
					hint="This is the value of the skill before effects are applied"
					:error-messages="errors.baseValue"
					:debounce-time="debounceTime"
				/>
				<proficiency-select
					style="flex-basis: 300px;"
					label="Base Proficiency"
					clearable
					:value="model.baseProficiency"
					:error-messages="errors.baseProficiency"
					@change="(value, ack) => $emit('change', {path: ['baseProficiency'], value, ack})"
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
			debounceTime: Number,
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
	};
</script>

<style lang="css" scoped>
</style>
