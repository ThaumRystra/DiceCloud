<template lang="html">
  <div class="attribute-form">
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
		<text-area
			label="Description"
			:value="model.description"
			:error-messages="errors.description"
			@change="(value, ack) => $emit('change', {path: ['description'], value, ack})"
			:debounce-time="debounceTime"
		/>
		<text-field
			label="Maximum prepared spells"
			:value="model.maxPrepared"
			@change="(value, ack) => $emit('change', {path: ['maxPrepared'], value, ack})"
			hint="How many spells can be prepared"
			:error-messages="errors.maxPrepared"
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
	};
</script>

<style lang="css" scoped>
</style>
