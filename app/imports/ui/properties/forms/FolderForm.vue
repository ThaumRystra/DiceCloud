<template lang="html">
  <div class="folder-form">
    <div class="layout wrap">
      <text-field
        ref="focusFirst"
        label="Name"
        style="flex-basis: 300px;"
        :value="model.name"
        :error-messages="errors.name"
        @change="change('name', ...arguments)"
      />
      <form-sections>
        <form-section
          v-if="$slots.children"
          name="Children"
        >
          <slot name="children" />
        </form-section>

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
  </div>
</template>

<script lang="js">
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
