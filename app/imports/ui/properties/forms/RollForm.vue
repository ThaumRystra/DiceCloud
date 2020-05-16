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
      <form-section name="Results">
        <v-slide-x-transition group>
          <div
            v-for="(rollResult, index) in model.rollResults"
            :key="rollResult._id || index"
          >
            <div class="layout row align-center">
              <text-field
                label="Comparison"
                style="flex-grow: 1;"
                hint="If the comparison is true, the results below will be applied"
                :value="rollResult.comparison"
                :error-messages="errors.rollResults && errors.rollResults[index] && errors.rollResults[index].comparison"
                :debounce-time="debounceTime"
                @change="(value, ack) => $emit('change', {path: ['rollResults', index, 'comparison'], value, ack})"
              />
              <v-btn
                outline
                icon
                large
                class="ma-3"
                @click="$emit('pull', {path: ['rollResults', index]})"
              >
                <v-icon>delete</v-icon>
              </v-btn>
            </div>
            <v-divider class="my-4" />
          </div>
        </v-slide-x-transition>
        <div class="layout row justify-center">
          <v-btn
            :loading="addResultLoading"
            :disabled="addResultLoading"
            outline
            @click="addResult"
          >
            <v-icon>add</v-icon>
            Add Result
          </v-btn>
        </div>
      </form-section>
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
