<template lang="html">
  <div class="attribute-form">
    <div class="layout row wrap">
      <text-field
        label="Name"
        :value="model.name"
        :error-messages="errors.name"
        @change="change('name', ...arguments)"
      />
    </div>
    <text-area
      label="Description"
      :value="model.description"
      :error-messages="errors.description"
      @change="change('description', ...arguments)"
    />
    <text-field
      label="Maximum prepared spells"
      :value="model.maxPrepared"
      hint="How many spells can be prepared"
      :error-messages="errors.maxPrepared"
      @change="change('maxPrepared', ...arguments)"
    />
  </div>
</template>

<script>
import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';

export default {
  mixins: [propertyFormMixin],
};
</script>

<style lang="css" scoped>
</style>
