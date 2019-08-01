<template lang="html">
  <div class="attribute-form">
		<text-field
			label="Name"
			:value="model.name"
			@change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
			:error-messages="errors.name"
			:debounce-time="debounceTime"
		/>
		<div class="layout row wrap">
			<smart-select
				label="Damage Type"
				style="flex-basis: 300px;"
				:items="damageTypes"
				:value="model.damageType"
				:error-messages="errors.damageType"
				:menu-props="{auto: true, lazy: true}"
				@change="(value, ack) => $emit('change', {path: ['damageType'], value, ack})"
				:debounce-time="debounceTime"
			/>
			<smart-select
				label="Value"
				style="flex-basis: 300px;"
				:items="values"
				:value="model.value"
				:error-messages="errors.value"
				:menu-props="{auto: true, lazy: true}"
				@change="(value, ack) => $emit('change', {path: ['value'], value, ack})"
				:debounce-time="debounceTime"
			/>
		</div>

  </div>
</template>

<script>
	import FormSection from '/imports/ui/properties/forms/shared/FormSection.vue';
	import DAMAGE_TYPES from '/imports/constants/DAMAGE_TYPES.js';

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
		data(){return {
			damageTypes: [
			  {
					value: "bludgeoning",
					text: "Bludgeoning",
				}, {
					value: "piercing",
					text: "Piercing",
				}, {
					value: "slashing",
					text: "Slashing",
				}, {
					value: "magicalBludgeoning",
					text: "Magical Bludgeoning",
				}, {
					value: "magicalPiercing",
					text: "Magical Piercing",
				}, {
					value: "magicalSlashing",
					text: "Magical Slashing",
				}, {
					value: "acid",
					text: "Acid",
				}, {
					value: "cold",
					text: "Cold",
				}, {
					value: "fire",
					text: "Fire",
				}, {
					value: "force",
					text: "Force",
				}, {
					value: "lightning",
					text: "Lightning",
				}, {
					value: "necrotic",
					text: "Necrotic",
				}, {
					value: "poison",
					text: "Poison",
				}, {
					value: "psychic",
					text: "Psychic",
				}, {
					value: "radiant",
					text: "Radiant",
				}, {
					value: "thunder",
					text: "Thunder",
				},
			],
			values: [
			  {
					value: 0,
					text: "Immunity",
				}, {
					value: 0.5,
					text: "Resistance",
				}, {
					value: 2,
					text: "Vulnerability",
				},
			],
		};},
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
