<template lang="html">
  <div class="folder-form">
		<div class="layout row wrap">
			<text-field
				label="Name"
				style="flex-basis: 300px;"
				:value="model.name"
				@change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
				:error-messages="errors.name"
				:debounce-time="debounceTime"
			/>
		</div>
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
