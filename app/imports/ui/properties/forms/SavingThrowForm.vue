<template lang="html">
  <div class="saving-throw-form">
    <text-field
      label="DC"
      :value="model.dc"
      :error-messages="errors.dc"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['dc'], value, ack})"
    />
    <text-field
      label="Ability"
      hint="Which ability the saving throw targets"
      :value="model.ability"
      :error-messages="errors.ability"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['ability'], value, ack})"
    />
    <form-sections>
      <form-section name="Results on successful save">
        <results-form
          :model="model.passResults"
          @change="({path, value, ack}) => $emit('change', {path: ['passResults', ...path], value, ack})"
          @push="({path, value, ack}) => $emit('push', {path: ['passResults', ...path], value, ack})"
          @pull="({path, ack}) => $emit('pull', {path: ['passResults', ...path], ack})"
        />
      </form-section>
      <form-section name="Results on failed save">
        <results-form
          :model="model.failResults"
          @change="({path, value, ack}) => $emit('change', {path: ['failResults', ...path], value, ack})"
          @push="({path, value, ack}) => $emit('push', {path: ['failResults', ...path], value, ack})"
          @pull="({path, ack}) => $emit('pull', {path: ['failResults', ...path], ack})"
        />
      </form-section>
    </form-sections>
  </div>
</template>

<script>
	import FormSection, {FormSections} from '/imports/ui/properties/forms/shared/FormSection.vue';
	import ResultsForm from '/imports/ui/properties/forms/ResultsForm.vue';

	export default {
		components: {
			FormSection,
			FormSections,
			ResultsForm,
		},
		props: {
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
	};
</script>

<style lang="css" scoped>
</style>
