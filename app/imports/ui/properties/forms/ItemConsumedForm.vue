<template lang="html">
  <div class="layout row">
    <text-field
      label="Item"
      hint="The item tag that will be consumed"
      style="flex-basis: 300px;"
      :value="model.tag"
      :error-messages="errors.tag"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['tag'], value, ack})"
    />
    <text-field
      label="Quantity"
      hint="How much of the item will be consumed"
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
