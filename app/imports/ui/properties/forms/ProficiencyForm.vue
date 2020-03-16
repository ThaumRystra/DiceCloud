<template lang="html">
	<div>
		<text-field
			label="Name"
			:value="model.name"
			@change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
			:error-messages="errors.name"
			:debounce-time="debounceTime"
		/>
		<div class="layout row wrap justify-start proficiency-form">
			<text-field
				label="Skill"
				class="mr-2"
				:value="model.stats[0]"
				:items="stats"
				:error-messages="errors.stats"
				:debounce-time="debounceTime"
				@change="(value, ack) => $emit('change', {path: ['stats'], value: [value], ack})"
			/>
			<proficiency-select
				label="Proficiency"
				style="flex-basis: 300px;"
				:value="model.value"
				@change="(value, ack) => $emit('change', {path: ['value'], value, ack})"
			/>
		</div>
	</div>
</template>

<script>
	import ProficiencySelect from '/imports/ui/properties/forms/shared/ProficiencySelect.vue';

	export default {
		components: {
			ProficiencySelect,
		},
		props: {
			model: {
				type: Object,
				default: () => ({}),
			},
			stats: {
				type: Array,
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
