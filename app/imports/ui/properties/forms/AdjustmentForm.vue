<template lang="html">
  <div class="adjustment-form">
    <div class="layout">
      <smart-combobox
        label="Attribute"
        hint="The attribute this adjustment will apply to"
        style="flex-basis: 300px;"
        :items="attributeList"
        :value="model.stat"
        :error-messages="errors.stat"
        @change="change('stat', ...arguments)"
      />
      <computed-field
        label="Amount"
        hint="The amount of damage to apply to the selected stat, can be a calculation or roll. Negative values will restore the selected from previous damage. If the operation is set, this is the final value of the stat instead."
        style="flex-basis: 300px;"
        :model="model.amount"
        :error-messages="errors.amount"
        @change="({path, value, ack}) =>
          $emit('change', {path: ['amount', ...path], value, ack})"
      />
    </div>
    <smart-select
      label="Operation"
      class="mx-1"
      style="flex-basis: 300px;"
      hint="Should the attribute be damaged by the amount, or set to the amount"
      :items="adjustmentOps"
      :value="model.operation"
      :error-messages="errors.operation"
      @change="change('operation', ...arguments)"
    />
    <smart-select
      v-if="parentTarget !== 'self'"
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
      multiple
      chips
      deletable-chips
      hint="Used to let slots find this property in a library, should otherwise be left blank"
      :value="model.tags"
      @change="change('tags', ...arguments)"
    />
  </div>
</template>

<script lang="js">
import attributeListMixin from '/imports/ui/properties/forms/shared/lists/attributeListMixin.js';
import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';

export default {
  mixins: [propertyFormMixin, attributeListMixin],
	props: {
		parentTarget: {
			type: String,
      default: undefined,
		},
	},
  data(){return {
    adjustmentOps: [
      {text: 'Damage', value: 'increment'},
      {text: 'Set', value: 'set'},
    ],
  }},
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
