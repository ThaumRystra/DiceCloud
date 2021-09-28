<template lang="html">
  <div>
    <div class="layout">
      <computed-field
        ref="focusFirst"
        label="Damage"
        hint="A caculation including dice rolls of the damge to deal to the target when activated by an action"
        :model="model.amount"
        :error-messages="errors.amount"
        @change="({path, value, ack}) =>
          $emit('change', {path: ['amount', ...path], value, ack})"
      />
      <calculation-error-list :errors="model.amountErrors" />
      <smart-select
        label="Damage Type"
        style="flex-basis: 200px;"
        hint="Use the Healing type to restore hit points"
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
    <smart-combobox
      label="Tags"
      class="mr-2"
      multiple
      chips
      deletable-chips
      hint="Used to let slots find this property in a library, should otherwise be left blank"
      :value="model.tags"
      :error-messages="errors.tags"
      @change="change('tags', ...arguments)"
    />
  </div>
</template>

<script lang="js">
import DAMAGE_TYPES from '/imports/constants/DAMAGE_TYPES.js';
import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';
import CalculationErrorList from '/imports/ui/properties/forms/shared/CalculationErrorList.vue';

export default {
  components: {
    CalculationErrorList,
  },
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
