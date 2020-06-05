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
