<template lang="html">
  <div class="item-form">
    <div class="layout row wrap">
      <text-field
        label="Name"
        :value="model.name"
        :error-messages="errors.name"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
      />
      <text-field
        label="Variable name"
        :value="model.variableName"
        style="flex-basis: 300px;"
        hint="Use this name in formulae to reference this attribute"
        :error-messages="errors.variableName"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['variableName'], value, ack})"
      />
    </div>
    <text-field
      label="Plural name"
      :value="model.plural"
      :error-messages="errors.plural"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['plural'], value, ack})"
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
    <text-field
      label="Quantity"
      type="number"
      min="0"
      :value="model.quantity"
      :error-messages="errors.quantity"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['quantity'], value, ack})"
    />
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
        label="Requires attunement"
        :input-value="model.requiresAttunement"
        :error-messages="errors.requiresAttunement"
        @change="e => $emit('change', {path: ['requiresAttunement'], value})"
      />
      <v-switch
        label="Show increment buttons"
        :input-value="model.showIncrement"
        :error-messages="errors.showIncrement"
        @change="e => $emit('change', {path: ['showIncrement'], value})"
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
