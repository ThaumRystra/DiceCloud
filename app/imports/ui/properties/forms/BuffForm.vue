<template lang="html">
  <div class="buff-form">
    <text-field
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
    />
    <text-area
      label="Description"
      :value="model.description"
      :error-messages="errors.description"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['description'], value, ack})"
    />
    <text-field
      label="Duration"
      hint="How long the buff lasts"
      :value="model.duration"
      :error-messages="errors.duration"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['duration'], value, ack})"
    />
  </div>
</template>

<script>
	export default {
		props: {
			stored: Boolean,
			model: {
				type: Object,
				default: () => ({}),
			},
			errors: {
				type: Object,
				default: () => ({}),
			},
			parentTarget: {
				type: String,
        default: undefined,
			},
      debounceTime: {
        type: Number,
        default: undefined,
      },
		},
		computed: {
			targetOptions(){
				if (this.parentTarget === 'singleTarget') {
					return [
						{
							text: 'Self',
							value: 'self',
						}, {
							text: 'Target',
							value: 'every',
						},
					];
				} else {
					return [
						{
							text: 'Self',
							value: 'self',
						}, {
							text: 'Roll once for each target',
							value: 'each',
						}, {
							text: 'Roll once and apply to every target',
							value: 'every',
						},
					];
				}
			},
			targetOptionHint(){
				let hints = {
					self: 'The buff will be applied to the character taking the action',
					target: 'The buff will be applied to the target of the action',
					each: 'The buff will be rolled separately for each of the targets of the action',
					every: 'The buff will be rolled once and applied to each of the targets of the action',
				};
				if (this.parentTarget === 'singleTarget'){
					hints.each = hints.target;
					hints.every = hints.target;
				}
				return hints[this.model.target];
			}
		}
	}
</script>

<style lang="css" scoped>
</style>
