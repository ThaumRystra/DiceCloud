<template lang="html">
  <div class="class-form">
		<div class="layout column align-center">
			<text-field
				label="XP"
				type="number"
				class="base-value-field text-xs-center large-format no-flex"
				:value="model.value"
				@change="(value, ack) => $emit('change', {path: ['value'], value, ack})"
				:error-messages="errors.value"
				:debounce-time="debounceTime"
			/>
		</div>
		<div class="layout row wrap">
			<text-field
				label="Title"
				style="flex-basis: 300px;"
				:value="model.name"
				@change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
				:error-messages="errors.name"
				:debounce-time="debounceTime"
			/>
			<text-field
				label="In-World date"
				:value="model.worldDate"
				style="flex-basis: 300px;"
				@change="(value, ack) => $emit('change', {path: ['worldDate'], value, ack})"
				hint="The date in-game that the experience occured"
				:error-messages="errors.worldDate"
				:debounce-time="debounceTime"
			/>
			<date-picker
				label="Real date"
				:value="model.date"
				style="flex-basis: 300px;"
				@change="(value, ack) => $emit('change', {path: ['date'], value, ack})"
				hint="Real life date"
				:error-messages="errors.date"
				:debounce-time="debounceTime"
			/>
		</div>
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
	};
</script>

<style lang="css" scoped>
</style>
