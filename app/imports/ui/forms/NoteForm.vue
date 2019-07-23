<template lang="html">
  <div class="feature-form">
  	<text-field
			label="Name"
			:value="model.name"
			@change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
			:error-messages="errors.name"
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
	};
</script>

<style lang="css" scoped>
</style>
