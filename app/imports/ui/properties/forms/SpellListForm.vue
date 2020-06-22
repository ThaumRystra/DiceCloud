<template lang="html">
  <div class="attribute-form">
    <div class="layout row wrap">
      <text-field
        ref="focusFirst"
        label="Name"
        :value="model.name"
        :error-messages="errors.name"
        @change="change('name', ...arguments)"
      />
      <text-field
        label="Variable name"
        :value="model.variableName"
        style="flex-basis: 300px;"
        hint="This name is used by spells to reference which lists they appear on"
        :error-messages="errors.variableName"
        @change="change('variableName', ...arguments)"
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
