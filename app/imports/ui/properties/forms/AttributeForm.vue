<template lang="html">
  <div class="attribute-form">
		<div class="layout column align-center">
			<text-field
				label="Base Value"
				type="number"
				class="base-value-field text-xs-center large-format no-flex"
				:value="model.baseValue"
				@change="(value, ack) => $emit('change', {path: ['baseValue'], value, ack})"
				hint="This is the value of the attribute before effects are applied"
				:error-messages="errors.baseValue"
				:debounce-time="debounceTime"
			/>
		</div>
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
				hint="Use this name in formulae to reference this attribute"
				:error-messages="errors.variableName"
				:debounce-time="debounceTime"
			/>
		</div>
		<smart-select
			label="Type"
			:items="attributeTypes"
			:value="model.attributeType"
			:error-messages="errors.attributeType"
			:menu-props="{auto: true, lazy: true}"
			@change="(value, ack) => $emit('change', {path: ['attributeType'], value, ack})"
			:hint="attributeTypeHints[model.attributeType]"
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
			<div class="layout column align-center">
				<v-switch
					label="Allow decimal values"
					class="no-flex"
					:input-value="model.decimal"
					:error-messages="errors.decimal"
					@change="e => $emit('change', {path: ['decimal'], value: !!e})"
				/>
				<div class="layout row justify-center" style="align-self: stretch;">
					<text-field
						label="Damage"
						type="number"
						class="damage-field text-xs-center"
						style="max-width: 300px;"
						hint="The attribute's final value is reduced by this amount"
						:value="model.damage"
						@change="(value, ack) => $emit('change', {path: ['damage'], value, ack})"
						:error-messages="errors.damage"
						:debounce-time="debounceTime"
					/>
				</div>
			</div>
			<div class="layout row wrap">
				<smart-select
					label="Reset"
					clearable
					style="flex-basis: 300px;"
					:items="resetOptions"
					:value="model.reset"
					:error-messages="errors.reset"
					:menu-props="{auto: true, lazy: true}"
					@change="(value, ack) => $emit('change', {path: ['reset'], value: value || '', ack})"
					:debounce-time="debounceTime"
				/>
				<text-field
					label="Reset Multiplier"
					type="number"
					style="flex-basis: 400px;"
					:value="model.resetMultiplier"
					:error-messages="errors.resetMultiplier"
					@change="(value, ack) => $emit('change', {path: ['resetMultiplier'], value, ack})"
					hint="Some attributes, like hit dice, only reset by half their total on a long rest"
					:debounce-time="debounceTime"
				/>
			</div>
		</form-section>
  </div>
</template>

<script>
	import FormSection from '/imports/ui/properties/forms/shared/FormSection.vue';

	export default {
		components: {
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
