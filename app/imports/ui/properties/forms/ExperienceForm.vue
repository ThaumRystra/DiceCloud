<template lang="html">
  <div class="class-form">
    <div class="layout row wrap">
      <text-field
        label="Title"
        style="flex-basis: 300px;"
        :value="model.name"
        :error-messages="errors.name"
        @change="change('name', ...arguments)"
      />
      <text-field
        label="In-World date"
        :value="model.worldDate"
        style="flex-basis: 300px;"
        hint="The date in-game that the experience occured"
        :error-messages="errors.worldDate"
        @change="change('worldDate', ...arguments)"
      />
      <date-picker
        label="Real date"
        :value="model.date"
        style="flex-basis: 300px;"
        hint="Real life date"
        :error-messages="errors.date"
        @change="change('date', ...arguments)"
      />
    </div>
    <text-area
      label="Description"
      :value="model.description"
      :error-messages="errors.description"
      @change="change('description', ...arguments)"
    />
    <div class="layout column align-end">
      <text-field
        label="XP gained"
        type="number"
        class="base-value-field text-xs-center large-format no-flex"
        hint="The number of experience points gained from this entry"
        :value="model.value"
        :error-messages="errors.value"
        @change="change('value', ...arguments)"
      />
    </div>
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
