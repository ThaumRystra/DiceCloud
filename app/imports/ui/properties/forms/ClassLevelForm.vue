<template lang="html">
  <div class="class-form">
    <div class="layout column align-center">
      <text-field
        label="Level"
        type="number"
        class="base-value-field text-xs-center large-format no-flex"
        :value="model.level"
        :error-messages="errors.level"
        @change="change('level', ...arguments)"
      />
    </div>
    <div class="layout row wrap">
      <text-field
        ref="focusFirst"
        label="Name"
        :value="model.name"
        :error-messages="errors.name"
        @change="change('name', ...arguments)"
      />
      <text-field
        label="Class variable name"
        :value="model.variableName"
        style="flex-basis: 300px;"
        hint="This should be the same for each level in a class"
        :error-messages="errors.variableName"
        @change="change('variableName', ...arguments)"
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
