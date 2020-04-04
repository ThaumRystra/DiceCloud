<template lang="html">
  <div class="attribute-form">
    <div class="layout row wrap">
      <text-field
        label="Name"
        :value="model.name"
        :error-messages="errors.name"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
      />
      <text-field
        label="Variable name"
        :value="model.variableName"
        style="flex-basis: 300px;"
        hint="Use this name in formulae to reference this attribute"
        :error-messages="errors.variableName"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['variableName'], value, ack})"
      />
    </div>
    <text-area
      label="Description"
      :value="model.description"
      :error-messages="errors.description"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['description'], value, ack})"
    />
    <text-field
      label="Maximum prepared spells"
      :value="model.maxPrepared"
      hint="How many spells can be prepared"
      :error-messages="errors.maxPrepared"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['maxPrepared'], value, ack})"
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
