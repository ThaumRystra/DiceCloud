<template lang="html">
  <div>
    <div class="layout row">
      <text-field
        label="Attribute"
        hint="The attribute this adjustment will apply to"
        style="flex-basis: 300px;"
        :value="model.stat"
        :error-messages="errors.stat"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['stat'], value, ack})"
      />
      <text-field
        label="Adjustment"
        hint="The amount of damage to apply to the selected stat, can be a calculation or roll"
        style="flex-basis: 300px;"
        :value="model.adjustment"
        :error-messages="errors.adjustment"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['adjustment'], value, ack})"
      />
    </div>
    <smart-select
      v-if="parentTarget !== 'self'"
      label="Target"
      :hint="targetOptionHint"
      :items="targetOptions"
      :value="model.target"
      :error-messages="errors.target"
      :menu-props="{auto: true, lazy: true}"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['target'], value, ack})"
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
				self: 'The damage will be applied to the character\'s own attribute when taking the action',
				target: 'The damage will be applied to the target of the action',
				each: 'The damage will be rolled separately for each of the targets of the action',
				every: 'The damage will be rolled once and applied to each of the targets of the action',
			};
			if (this.parentTarget === 'singleTarget'){
				hints.each = hints.target;
				hints.every = hints.target;
			}
			return hints[this.model.target];
		}
	},
}
</script>

<style lang="css" scoped>
</style>
