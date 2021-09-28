<template lang="html">
  <div class="roll-form">
    <div class="layout wrap">
      <text-field
        label="Name"
        :value="model.name"
        :error-messages="errors.name"
        @change="change('name', ...arguments)"
      />
      <text-field
        label="Variable name"
        :value="model.variableName"
        style="flex-basis: 300px;"
        hint="Use this name in action formulae to refer to the result of this roll"
        :error-messages="errors.variableName"
        @change="change('variableName', ...arguments)"
      />
    </div>
    <computed-field
      label="Roll bonus"
      hint="The calculation that will be evaluated when the roll is triggered by an action. The result will be saved as the variable name in the context of the roll."
      :model="model.roll"
      :error-messages="errors.roll"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['roll', ...path], value, ack})"
    />
    <form-sections>
      <form-section name="Advanced">
        <smart-combobox
          label="Tags"
          multiple
          chips
          deletable-chips
          hint="Used to let slots find this property in a library, should otherwise be left blank"
          :value="model.tags"
          @change="change('tags', ...arguments)"
        />
      </form-section>
    </form-sections>
  </div>
</template>

<script lang="js">
	import FormSection, {FormSections} from '/imports/ui/properties/forms/shared/FormSection.vue';
  import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';

	export default {
		components: {
			FormSection,
			FormSections,
		},
    mixins: [propertyFormMixin],
		data(){return {
			addResultLoading: false,
		}},
		methods: {
			acknowledgeAddResult(){
				this.addResultLoading = false;
			},
		},
	};
</script>

<style lang="css" scoped>
	.no-flex {
		flex: initial;
	}
	.layout.row.wrap {
		margin-right: -8px;
	}
	.layout.row.wrap > *{
		margin-right: 8px;
	}
</style>
