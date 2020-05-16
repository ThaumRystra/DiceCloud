<template lang="html">
  <div class="saving-throw-form">
    <text-field
      label="DC"
      :value="model.dc"
      :error-messages="errors.dc"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['dc'], value, ack})"
    />
    <text-field
      label="Ability"
      hint="Which ability the saving throw targets"
      :value="model.ability"
      :error-messages="errors.ability"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['ability'], value, ack})"
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
      debounceTime: {
        type: Number,
        default: undefined,
      },
		},
	};
</script>

<style lang="css" scoped>
</style>
