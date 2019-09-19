<template lang="html">
  <div class="roll-form">
		<text-field
			label="Roll"
			prefix="d20+"
			:value="model.rollBonus"
			@change="(value, ack) => $emit('change', {path: ['rollBonus'], value, ack})"
			:error-messages="errors.rollBonus"
			:debounce-time="debounceTime"
		/>
		<v-combobox
	    label="Tags"
	    multiple
			chips
			deletable-chips
			box
			:value="model.tags"
			@change="(value) => $emit('change', {path: ['tags'], value})"
	  />
		<form-sections>
			<form-section name="Advanced">
			</form-section>
		</form-sections>
  </div>
</template>

<script>
	import FormSection, {FormSections} from '/imports/ui/properties/forms/shared/FormSection.vue';
	import AdjustmentListForm from '/imports/ui/properties/forms/AdjustmentListForm.vue';
	import BuffListForm from '/imports/ui/properties/forms/BuffListForm.vue';

	export default {
		components: {
			FormSection,
			FormSections,
			AdjustmentListForm,
			BuffListForm,
		},
		props: {
			stored: {
				type: Boolean,
			},
			model: {
				type: Object,
				default: () => ({}),
			},
			errors: {
				type: Object,
				default: () => ({}),
			},
			debounceTime: Number,
		},
		data(){return {
			rollTypes: [
				{
					text: 'Roll',
					value: 'roll',
				}, {
					text: 'Saving Throw',
					value: 'savingThrow',
				},
			],
		};},
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
