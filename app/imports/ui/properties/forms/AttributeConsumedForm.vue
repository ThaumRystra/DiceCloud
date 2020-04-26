<template lang="html">
  <div class="layout row">
    <text-field
      label="Attribute"
      hint="The attribute variable name that will be consumed"
      style="flex-basis: 300px;"
      :value="model.variableName"
      :error-messages="errors.variableName"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['variableName'], value, ack})"
    />
    <text-field
      label="Quantity"
      hint="How much of the attribute will be consumed"
      style="flex-basis: 300px;"
      :value="model.quantity"
      :error-messages="errors.quantity"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['quantity'], value, ack})"
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
}
</script>
