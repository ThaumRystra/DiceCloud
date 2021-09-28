<template lang="html">
  <div class="saving-throw-form">
    <text-field
      ref="focusFirst"
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      @change="change('name', ...arguments)"
    />

    <computed-field
      label="DC"
      hint="A calculation of the DC that the target of an action needs to save against in order to succeed. If the saving throw is lower than the DC, the children of this property will be activated."
      :model="model.dc"
      :error-messages="errors.dc"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['dc', ...path], value, ack})"
    />

    <smart-combobox
      label="Save"
      hint="Which stat the saving throw targets"
      :value="model.stat"
      :items="saveList"
      :error-messages="errors.stat"
      @change="change('stat', ...arguments)"
    />
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
import saveListMixin from '/imports/ui/properties/forms/shared/lists/saveListMixin.js';
import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';

export default {
  mixins: [saveListMixin, propertyFormMixin],
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
};
</script>
