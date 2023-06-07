<template lang="html">
  <div class="slot-filler-form">
    <text-area
      label="Description"
      :value="model.description"
      :error-messages="errors['description.text']"
      @change="change('description', ...arguments)"
    />
    <form-sections
      v-if="$slots.default"
    >
      <slot />
    </form-sections>
  </div>
</template>

<script lang="js">
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin.js';

export default {
  mixins: [propertyFormMixin],
};
</script>
