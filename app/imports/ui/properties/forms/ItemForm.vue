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
        label="Plural name"
        :value="model.plural"
        :error-messages="errors.plural"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['plural'], value, ack})"
      />
    </div>
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
        label="Show increment buttons"
        :input-value="model.showIncrement"
        :error-messages="errors.showIncrement"
        @change="value => $emit('change', {path: ['showIncrement'], value})"
      />
      <smart-combobox
        label="Tags"
        class="mr-2"
        multiple
        chips
        deletable-chips
        :value="model.tags"
        :error-messages="errors.tags"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['tags'], value, ack})"
      />
      <v-switch
        label="Requires attunement"
        :input-value="model.requiresAttunement"
        :error-messages="errors.requiresAttunement"
        @change="value => $emit('change', {path: ['requiresAttunement'], value})"
      />
      <v-expand-transition>
        <div
          v-show="model.requiresAttunement"
          style="padding-top: 0.1px;"
        >
          <v-switch
            label="Attuned"
            :input-value="model.attuned"
            :error-messages="errors.attuned"
            @change="value => $emit('change', {path: ['attuned'], value})"
          />
        </div>
      </v-expand-transition>
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
