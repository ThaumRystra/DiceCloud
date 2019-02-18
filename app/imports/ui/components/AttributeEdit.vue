<template lang="html">
  <div>
  	<text-field
			label="Name"
			:value="attribute.name"
			@change="(name, ack) => $emit('change', {name}, ack)"
		/>
		<text-field
			label="Variable name"
			:value="attribute.variableName"
			@change="(variableName, ack) => $emit('change', {variableName}, ack)"
			hint="Use this name in formulae to reference this attribute"
		/>
		<text-field
			label="Base Value"
			type="number"
			:value="attribute.baseValue"
			@change="(baseValue, ack) => $emit('change', {baseValue: +baseValue}, ack)"
			hint="This is the value of the attribute before effects are applied"
		/>
		<text-field
			label="Damage"
			type="number"
			:value="-attribute.adjustment"
			@change="(damage, ack) => $emit('change', {adjustment: -damage || null}, ack)"
		/>
		<smart-select
			label="Type"
			:items="attributeTypes"
			:value="attribute.type"
			:menu-props="{auto: true, lazy: true}"
			@change="(type, ack) => $emit('change', {type}, ack)"
		/>
		<v-switch
			label="Allow decimal values"
			:value="attribute.decimal"
			@change="e => $emit('change', {decimal: !!e})"
		/>
		<smart-select
			label="Reset"
			append-icon="arrow_drop_down"
			clearable
			:items="resetOptions"
			:value="attribute.reset"
			:menu-props="{auto: true, lazy: true}"
			@change="(reset, ack) => $emit('change', {reset}, ack)"
		/>
		<text-field
			label="Reset Multiplier"
			type="number"
			:value="attribute.resetMultiplier"
			@change="(resetMultiplier, ack) => $emit('change', {resetMultiplier: +resetMultiplier}, ack)"
			hint="Some attributes, like hit dice, only reset by half their total on a long rest"
		/>
  </div>
</template>

<script>
	export default {
		props: {
			attribute: {
				type: Object,
				default: {},
			},
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
