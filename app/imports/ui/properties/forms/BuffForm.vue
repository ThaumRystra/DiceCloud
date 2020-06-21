<template lang="html">
  <div class="buff-form">
    <text-field
      ref="focusFirst"
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      @change="change('name', ...arguments)"
    />
    <text-area
      label="Description"
      :value="model.description"
      :error-messages="errors.description"
      @change="change('description', ...arguments)"
    />
    <!-- Duration not implemented yet
    <text-field
      label="Duration"
      hint="How long the buff lasts"
      :value="model.duration"
      :error-messages="errors.duration"
      @change="change('duration', ...arguments)"
    />
    -->
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
  import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';

	export default {
    mixins: [propertyFormMixin],
		props: {
			parentTarget: {
				type: String,
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
