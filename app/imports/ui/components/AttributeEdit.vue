<template lang="html">
  <div>
  	<text-field
			label="Name"
			:value="attribute.name"
			@input="name => $emit('change', {name})"
		/>
		<text-field
			label="Variable name"
			:value="attribute.variableName"
			@input="variableName => $emit('change', {variableName})"
			hint="Use this name in formulae to reference this attribute"
		/>
		<text-field
			label="Base Value"
			type="number"
			:value="attribute.baseValue"
			@input="baseValue => $emit('change', {baseValue})"
			hint="This is the value of the attribute before effects are applied"
		/>
		<text-field
			label="Damage"
			type="number"
			:value="-attribute.adjustment"
			@input="damage => $emit('change', {adjustment: -damage || null})"
		/>
		<v-select
			label="Type"
			color="accent"
			:items="attributeTypes"
			:value="attribute.type"
			:menu-props="{auto: true, lazy: true}"
			@input="type => $emit('change', {type})"
		/>
		<v-switch
			label="Allow decimal values"
			:value="attribute.decimal"
			@change="e => $emit('change', {decimal: e})"
		/>
		<v-select
			label="Reset"
			color="accent"
			append-icon="arrow_drop_down"
			clearable
			:items="resetOptions"
			:value="attribute.reset"
			:menu-props="{auto: true, lazy: true}"
			@input="reset => $emit('change', {reset})"
		/>
		<text-field
			label="Reset Multiplier"
			type="number"
			:value="attribute.resetMultiplier"
			@input="resetMultiplier => $emit('change', {resetMultiplier})"
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
