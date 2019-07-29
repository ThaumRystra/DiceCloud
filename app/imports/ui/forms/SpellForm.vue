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
				label="Level"
				class="mx-1"
				style="flex-basis: 300px;"
				:items="spellLevels"
				:value="model.level"
				:error-messages="errors.level"
				@change="(value, ack) => $emit('change', {path: ['level'], value, ack})"
				:debounce-time="debounceTime"
			/>
			<smart-select
				label="School"
				class="mx-1"
				style="flex-basis: 300px;"
				:items="magicSchools"
				:value="model.school"
				:error-messages="errors.school"
				@change="(value, ack) => $emit('change', {path: ['school'], value, ack})"
				:debounce-time="debounceTime"
			/>
		</div>
		<div class="layout row wrap">
			<v-combobox
				label="Spell lists"
				multiple
				chips
				deletable-chips
				box
				:value="model.spellLists"
				@change="(value) => $emit('change', {path: ['spellLists'], value})"
				:error-messages="errors.spellLists"
			/>
			<v-switch
			label="Always prepared"
			style="width: 200px; flex-grow: 0;"
			class="ml-2"
			:value="model.alwaysPrepared"
			:error-messages="errors.alwaysPrepared"
			@change="e => $emit('change', {path: ['alwaysPrepared'], value: !!e})"
			/>
		</div>
		<text-field
			label="Casting Time"
			:value="model.castingTime"
			@change="(value, ack) => $emit('change', {path: ['castingTime'], value, ack})"
			:error-messages="errors.castingTime"
			:debounce-time="debounceTime"
		/>
		<text-field
			label="Range"
			:value="model.range"
			@change="(value, ack) => $emit('change', {path: ['range'], value, ack})"
			:error-messages="errors.range"
			:debounce-time="debounceTime"
		/>
		<div class="layout row wrap justify-space-between">
			<v-checkbox
				label="Verbal"
				:value="model.verbal"
				:error-messages="errors.verbal"
				@change="(value) => $emit('change', {path: ['verbal'], value})"
			/>
			<v-checkbox
				label="Somatic"
				:value="model.somatic"
				:error-messages="errors.somatic"
				@change="(value) => $emit('change', {path: ['somatic'], value})"
			/>
			<v-checkbox
				label="Concentration"
				:value="model.concentration"
				:error-messages="errors.concentration"
				@change="(value) => $emit('change', {path: ['concentration'], value})"
			/>
			<v-checkbox
				label="Ritual"
				:value="model.ritual"
				:error-messages="errors.ritual"
				@change="(value) => $emit('change', {path: ['ritual'], value})"
			/>
		</div>
		<text-field
			label="Material"
			:value="model.material"
			@change="(value, ack) => $emit('change', {path: ['material'], value, ack})"
			:error-messages="errors.material"
			:debounce-time="debounceTime"
		/>
		<text-field
			label="Duration"
			:value="model.duration"
			@change="(value, ack) => $emit('change', {path: ['duration'], value, ack})"
			:error-messages="errors.duration"
			:debounce-time="debounceTime"
		/>
		<text-area
			label="Description"
			:value="model.description"
			:error-messages="errors.description"
			@change="(value, ack) => $emit('change', {path: ['description'], value, ack})"
			:debounce-time="debounceTime"
		/>
  </div>
</template>

<script>
	export default {
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
			magicSchools: [
				{
					text: 'Abjuration',
					value: 'abjuration',
				}, {
					text: 'Conjuration',
					value: 'conjuration',
				}, {
					text: 'Divination',
					value: 'divination',
				}, {
					text: 'Enchantment',
					value: 'enchantment',
				}, {
					text: 'Evocation',
					value: 'evocation',
				}, {
					text: 'Illusion',
					value: 'illusion',
				}, {
					text: 'Necromancy',
					value: 'necromancy',
				}, {
					text: 'Transmutation',
					value: 'transmutation',
				},
			],
			spellLevels: [
				{
					text: 'Cantrip',
					value: 0,
				}, {
					text: 'Level 1',
					value: 1,
				}, {
					text: 'Level 2',
					value: 2,
				}, {
					text: 'Level 3',
					value: 3,
				}, {
					text: 'Level 4',
					value: 4,
				}, {
					text: 'Level 5',
					value: 5,
				}, {
					text: 'Level 6',
					value: 6,
				}, {
					text: 'Level 7',
					value: 7,
				}, {
					text: 'Level 8',
					value: 8,
				}, {
					text: 'Level 9',
					value: 9,
				},
			],
		};},
	};
</script>

<style lang="css" scoped>
	.v-input--checkbox {
		flex-grow: 0;
		width: 200px;
	}
</style>
