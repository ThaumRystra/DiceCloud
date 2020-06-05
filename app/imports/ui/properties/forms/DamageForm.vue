<template lang="html">
  <div>
    <div class="layout row">
      <text-field
        ref="focusFirst"
        label="Damage"
        style="flex-basis: 300px;"
        :value="model.amount"
        :error-messages="errors.amount"
        @change="change('amount', ...arguments)"
      />
      <smart-select
        label="Damage Type"
        style="flex-basis: 200px;"
        :items="DAMAGE_TYPES"
        :value="model.damageType"
        :error-messages="errors.damageType"
        :menu-props="{auto: true}"
        @change="change('damageType', ...arguments)"
      />
    </div>
    <smart-select
      label="Target"
      :hint="targetOptionHint"
      :items="targetOptions"
      :value="model.target"
      :error-messages="errors.target"
      :menu-props="{auto: true, lazy: true}"
      @change="change('target', ...arguments)"
    />
  </div>
</template>

<script>
import DAMAGE_TYPES from '/imports/constants/DAMAGE_TYPES.js';
import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';

export default {
  mixins: [propertyFormMixin],
	props: {
		parentTarget: {
			type: String,
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
