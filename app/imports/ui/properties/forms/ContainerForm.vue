<template lang="html">
  <div class="attribute-form">
    <text-field
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
    />
    <div class="layout row wrap">
      <text-field
        label="Value"
        suffix="gp"
        type="number"
        min="0"
        hint="The value of the item in gold pieces, using decimals for values less than 1 gp"
        class="mx-1"
        style="flex-basis: 300px;"
        :value="model.value"
        :error-messages="errors.value"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['value'], value, ack})"
      />
      <text-field
        label="Weight"
        suffix="lbs"
        type="number"
        min="0"
        class="mx-1"
        style="flex-basis: 300px;"
        :value="model.weight"
        :error-messages="errors.weight"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['weight'], value, ack})"
      />
    </div>
    <text-area
      label="Description"
      :value="model.description"
      :error-messages="errors.description"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['description'], value, ack})"
    />
    <form-section
      name="Advanced"
      standalone
    >
      <v-switch
        label="Carried"
        :input-value="model.carried"
        :error-messages="errors.carried"
        @change="e => $emit('change', {path: ['carried'], value})"
      />
      <v-switch
        label="Contents are weightless"
        :input-value="model.contentsWeightless"
        :error-messages="errors.contentsWeightless"
        @change="e => $emit('change', {path: ['contentsWeightless'], value})"
      />
    </form-section>
  </div>
</template>

<script>
import FormSection from '/imports/ui/properties/forms/shared/FormSection.vue';

export default {
	components: {
		FormSection,
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
	}
</script>
