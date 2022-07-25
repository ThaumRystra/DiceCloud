<template lang="html">
  <div class="saving-throw-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          ref="focusFirst"
          label="Name"
          :value="model.name"
          :error-messages="errors.name"
          @change="change('name', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <computed-field
          label="DC"
          hint="A calculation of the DC that the target of an action needs to save against in order to succeed. If the saving throw is lower than the DC, the children of this property will be activated."
          :model="model.dc"
          :error-messages="errors.dc"
          @change="({path, value, ack}) =>
            $emit('change', {path: ['dc', ...path], value, ack})"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <smart-combobox
          label="Save"
          hint="Which stat the saving throw targets"
          :value="model.stat"
          :items="saveList"
          :error-messages="errors.stat"
          @change="change('stat', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <smart-select
          label="Target"
          :hint="targetOptionHint"
          :items="targetOptions"
          :value="model.target"
          :error-messages="errors.target"
          :menu-props="{auto: true, lazy: true}"
          @change="change('target', ...arguments)"
        />
      </v-col>
    </v-row>
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
    <form-section
      v-if="$slots.children"
      name="Children"
      standalone
    >
      <slot name="children" />
    </form-section>
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
					text: 'Target',
					value: 'target',
				},
			];
		},
		targetOptionHint(){
			let hints = {
				self: 'The save will be applied to the character taking the action',
				target: 'The save will be applied to the targets of the action',
			};
			return hints[this.model.target];
		}
	},
};
</script>
