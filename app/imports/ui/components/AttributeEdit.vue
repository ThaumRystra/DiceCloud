<template lang="html">
  <div>
  	<text-field
			label="Name"
			:value="attribute.name"
			@change="(name, ack) => $emit('change', {name}, ack)"
			:error-messages="errors.name"
			:debounce-time="debounceTime"
		/>
		<text-field
			label="Variable name"
			:value="attribute.variableName"
			@change="(variableName, ack) => $emit('change', {variableName}, ack)"
			hint="Use this name in formulae to reference this attribute"
			:error-messages="errors.variableName"
			:debounce-time="debounceTime"
		/>
		<text-field
			label="Base Value"
			type="number"
			:value="attribute.baseValue"
			@change="(baseValue, ack) => $emit('change', {baseValue: +baseValue}, ack)"
			hint="This is the value of the attribute before effects are applied"
			:error-messages="errors.baseValue"
			:debounce-time="debounceTime"
		/>
		<text-field
			label="Damage"
			type="number"
			:value="-attribute.adjustment"
			@change="(damage, ack) => $emit('change', {adjustment: -damage || null}, ack)"
			:error-messages="errors.adjustment"
			:debounce-time="debounceTime"
		/>
		<smart-select
			label="Type"
			:items="attributeTypes"
			:value="attribute.type"
			:error-messages="errors.type"
			:menu-props="{auto: true, lazy: true}"
			@change="(type, ack) => $emit('change', {type}, ack)"
			:debounce-time="debounceTime"
		/>
		<v-switch
			label="Allow decimal values"
			:value="attribute.decimal"
			:error-messages="errors.decimal"
			@change="e => $emit('change', {decimal: !!e})"
		/>
		<smart-select
			label="Reset"
			clearable
			:items="resetOptions"
			:value="attribute.reset"
			:error-messages="errors.reset"
			:menu-props="{auto: true, lazy: true}"
			@change="(reset, ack) => $emit('change', {reset}, ack)"
			:debounce-time="debounceTime"
		/>
		<text-field
			label="Reset Multiplier"
			type="number"
			:value="attribute.resetMultiplier"
			:error-messages="errors.resetMultiplier"
			@change="(resetMultiplier, ack) => $emit('change', {resetMultiplier: +resetMultiplier}, ack)"
			hint="Some attributes, like hit dice, only reset by half their total on a long rest"
			:debounce-time="debounceTime"
		/>
  </div>
</template>

<script>
	export default {
		props: {
			attribute: {
				type: Object,
				default: () => ({}),
			},
			errors: {
				type: Object,
				default: () => ({}),
			},
			debounceTime: Number,
		},
		data(){ return{
			attributeTypes: [
				{
					text: 'Ability score',
					value: 'ability',
				}, {
					text: 'Stat',
					value: 'stat',
				}, {
					text: 'Modifier',
					value: 'modifier',
				}, {
					text: 'Hit dice',
					value: 'hitDice',
				}, {
					text: 'Health bar',
					value: 'healthBar',
				}, {
					text: 'Resource',
					value: 'resource',
				}, {
					text: 'Spell slot',
					value: 'spellSlot',
				}, {
					text: 'Utility',
					value: 'utility',
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
			]
		}},
	};
</script>

<style lang="css" scoped>
</style>
