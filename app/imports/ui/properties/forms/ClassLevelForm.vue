<template lang="html">
  <div class="class-form">
		<div class="layout column align-center">
			<text-field
				label="Level"
				type="number"
				class="base-value-field text-xs-center large-format no-flex"
				:value="model.level"
				@change="(value, ack) => $emit('change', {path: ['level'], value, ack})"
				:error-messages="errors.level"
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
				hint="Use this name in formulae to reference this class"
				:error-messages="errors.variableName"
				:debounce-time="debounceTime"
			/>
			<text-field
				label="Base Class Variable name"
				:value="model.baseClass"
				style="flex-basis: 300px;"
				@change="(value, ack) => $emit('change', {path: ['baseClass'], value, ack})"
				hint="This is the name of the class this class level belongs to"
				:error-messages="errors.baseClass"
				:debounce-time="debounceTime"
			/>
		</div>
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
