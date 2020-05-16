<template lang="html">
  <div class="class-form">
    <div class="layout column align-center">
      <text-field
        label="Level"
        type="number"
        class="base-value-field text-xs-center large-format no-flex"
        :value="model.level"
        :error-messages="errors.level"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['level'], value, ack})"
      />
    </div>
    <div class="layout row wrap">
      <text-field
        label="Name"
        :value="model.name"
        :error-messages="errors.name"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
      />
      <text-field
        label="Class variable name"
        :value="model.variableName"
        style="flex-basis: 300px;"
        hint="This should be the same for each level in a class"
        :error-messages="errors.variableName"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['variableName'], value, ack})"
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
      debounceTime: {
        type: Number,
        default: undefined,
      },
		},
	};
</script>

<style lang="css" scoped>
</style>
