<template lang="html">
	<div class="layout row wrap justify-start proficiency-form">
		<text-field
			label="Skill"
			class="mr-2"
			append-icon="arrow_drop_down"
			item-text="name"
			item-value="skill"
			style="flex-basis: 300px;"
			:menu-props="{transition: 'slide-y-transition', lazy: true}"
			:value="model.skill"
			:items="undefined"
			@change="(value, ack) => $emit('change', {path: ['skill'], value, ack})"
		/>
		<proficiency-select
			label="Proficiency"
			style="flex-basis: 300px;"
			:value="model.value"
			@change="(value, ack) => $emit('change', {path: ['value'], value, ack})"
		/>
	</div>
</template>

<script>
	import ProficiencySelect from '/imports/ui/forms/components/ProficiencySelect.vue';

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
