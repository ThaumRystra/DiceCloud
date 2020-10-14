<template lang="html">
  <div class="folder-form">
    <div class="layout row wrap">
      <text-field
        ref="focusFirst"
        label="Name"
        style="flex-basis: 300px;"
        :value="model.name"
        :error-messages="errors.name"
        @change="change('name', ...arguments)"
      />
      <form-section
        name="Advanced"
        standalone
      >
        <smart-combobox
          label="Tags"
          multiple
          chips
          deletable-chips
          :value="model.tags"
          @change="change('tags', ...arguments)"
        />
      </form-section>
    </div>
  </div>
</template>

<script>
  import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';
  import FormSection from '/imports/ui/properties/forms/shared/FormSection.vue';

	export default {
    components: {
			FormSection,
		},
    mixins: [propertyFormMixin],
	};
</script>

<style lang="css" scoped>
</style>
