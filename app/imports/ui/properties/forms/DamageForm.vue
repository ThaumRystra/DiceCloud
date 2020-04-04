<template lang="html">
  <div>
    <div class="layout row">
      <text-field
        label="Damage"
        style="flex-basis: 300px;"
        :value="model.damage"
        :error-messages="errors.damage"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['damage'], value, ack})"
      />
      <smart-select
        label="Damage Type"
        style="flex-basis: 200px;"
        :items="DAMAGE_TYPES"
        :value="model.damageType"
        :error-messages="errors.damageType"
        :menu-props="{auto: true}"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['damageType'], value, ack})"
      />
    </div>
    <smart-select
      v-if="parentTarget == 'multipleTargets'"
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
import DAMAGE_TYPES from '/imports/constants/DAMAGE_TYPES.js';

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
	data(){return{
		DAMAGE_TYPES,
	}},
	computed: {
		targetOptions(){
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
