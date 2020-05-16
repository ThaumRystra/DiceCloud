<template lang="html">
  <div class="roll-form">
    <text-field
      label="Roll"
      :value="model.roll"
      :error-messages="errors.roll"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['roll'], value, ack})"
    />
    <form-sections>
      <form-section name="Advanced">
        <v-combobox
          label="Tags"
          multiple
          chips
          deletable-chips
          box
          :value="model.tags"
          @change="(value) => $emit('change', {path: ['tags'], value})"
        />
      </form-section>
    </form-sections>
  </div>
</template>

<script>
	import FormSection, {FormSections} from '/imports/ui/properties/forms/shared/FormSection.vue';

	export default {
		components: {
			FormSection,
			FormSections,
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
      debounceTime: {
        type: Number,
        default: undefined,
      },
		},
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
