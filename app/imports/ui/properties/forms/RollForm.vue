<template lang="html">
  <div class="roll-form">
    <text-field
      ref="focusFirst"
      label="Roll"
      :value="model.roll"
      :error-messages="errors.roll"
      @change="change('roll', ...arguments)"
    />
    <form-sections>
      <form-section name="Advanced">
        <smart-combobox
          label="Tags"
          multiple
          chips
          deletable-chips
          :value="model.tags"
          @change="change('tags', ...arguments)"
        />
      </form-section>
    </form-sections>
  </div>
</template>

<script>
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
