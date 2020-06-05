<template lang="html">
  <div class="attribute-form">
    <div class="layout row justify-space-between wrap">
      <text-field
        ref="focusFirst"
        label="Name"
        :value="model.name"
        :error-messages="errors.name"
        @change="change('name', ...arguments)"
      />
      <div>
        <smart-switch
          label="Carried"
          class="mx-3"
          :value="model.carried"
          :error-messages="errors.carried"
          @change="change('carried', ...arguments)"
        />
      </div>
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
        prepend-inner-icon="$vuetify.icons.two_coins"
        :value="model.value"
        :error-messages="errors.value"
        @change="change('value', ...arguments)"
      />
      <text-field
        label="Weight"
        suffix="lb"
        type="number"
        min="0"
        class="mx-1"
        style="flex-basis: 300px;"
        prepend-inner-icon="$vuetify.icons.weight"
        :value="model.weight"
        :error-messages="errors.weight"
        @change="change('weight', ...arguments)"
      />
    </div>
    <text-area
      label="Description"
      :value="model.description"
      :error-messages="errors.description"
      @change="change('description', ...arguments)"
    />
    <form-section
      name="Advanced"
      standalone
    >
      <div class="layout row justify-center">
        <div>
          <smart-switch
            label="Contents are weightless"
            :value="model.contentsWeightless"
            :error-messages="errors.contentsWeightless"
            @change="change('contentsWeightless', ...arguments)"
          />
        </div>
      </div>
    </form-section>
  </div>
</template>

<script>
import FormSection from '/imports/ui/properties/forms/shared/FormSection.vue';
import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';

export default {
	components: {
		FormSection,
	},
  mixins: [propertyFormMixin],
}
</script>
