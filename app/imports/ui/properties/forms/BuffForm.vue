<template lang="html">
  <div class="buff-form">
    <text-field
      ref="focusFirst"
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      @change="change('name', ...arguments)"
    />
    <smart-switch
      label="Applied"
      class="mt-0"
      :value="model.applied"
      :error-messages="errors.applied"
      @change="change('applied', ...arguments)"
    />
    <v-expand-transition>
      <div v-if="model.applied">
        <v-alert
          type="info"
          outlined
        >
          When buffs are applied they become active on a creature.
          Turn this off if the buff needs to be applied to a target by an action
          or spell.
        </v-alert>
      </div>
    </v-expand-transition>

    <inline-computation-field
      label="Description"
      :model="model.description"
      :error-messages="errors.description"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <!-- Duration not implemented yet
    <computed-field
      label="Duration"
      hint="How many rounds the buff lasts"
      :model="model.duration"
      :error-messages="errors.duration"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['duration', ...path], value, ack})"
    />
    -->
    <v-expand-transition>
      <smart-select
        v-if="!model.applied"
        label="Target"
        :hint="targetOptionHint"
        :items="targetOptions"
        :value="model.target"
        :error-messages="errors.target"
        :menu-props="{auto: true, lazy: true}"
        @change="change('target', ...arguments)"
      />
    </v-expand-transition>
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
