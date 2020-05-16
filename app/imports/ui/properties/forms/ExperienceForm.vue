<template lang="html">
  <div class="class-form">
    <div class="layout row wrap">
      <text-field
        label="Title"
        style="flex-basis: 300px;"
        :value="model.name"
        :error-messages="errors.name"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
      />
      <text-field
        label="In-World date"
        :value="model.worldDate"
        style="flex-basis: 300px;"
        hint="The date in-game that the experience occured"
        :error-messages="errors.worldDate"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['worldDate'], value, ack})"
      />
      <date-picker
        label="Real date"
        :value="model.date"
        style="flex-basis: 300px;"
        hint="Real life date"
        :error-messages="errors.date"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['date'], value, ack})"
      />
    </div>
    <text-area
      label="Description"
      :value="model.description"
      :error-messages="errors.description"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['description'], value, ack})"
    />
    <div class="layout column align-end">
      <text-field
        label="XP gained"
        type="number"
        class="base-value-field text-xs-center large-format no-flex"
        hint="The number of experience points gained from this entry"
        :value="model.value"
        :error-messages="errors.value"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['value'], value, ack})"
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
