<template lang="html">
  <div class="class-form">
    <div class="layout column align-center">
      <text-field
        label="Level"
        type="number"
        class="base-value-field text-center large-format no-flex"
        :value="model.level"
        :error-messages="errors.level"
        @change="change('level', ...arguments)"
      />
    </div>
    <div class="layout wrap">
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
        hint="This should be the same for each level in a class, use `variablName.level` to reference the highest class level for a given class variable name in calculations"
        :error-messages="errors.variableName"
        @change="change('variableName', ...arguments)"
      />
    </div>
    <text-field
      v-if="context.isLibraryForm"
      label="Condition"
      hint="A caclulation to determine if this can be added to the character"
      placeholder="Always active"
      :value="model.slotFillerCondition"
      :error-messages="errors.slotFillerCondition"
      @change="change('slotFillerCondition', ...arguments)"
    />

    <inline-computation-field
      label="Description"
      hint="A brief description of what this class level gives a character"
      :model="model.description"
      :error-messages="errors.description"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />
    <smart-combobox
      label="Tags"
      multiple
      chips
      deletable-chips
      hint="Used to let slots find this property in a library"
      :value="model.tags"
      :error-messages="errors.tags"
      @change="change('tags', ...arguments)"
    />
  </div>
</template>

<script lang="js">
  import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';

	export default {
    mixins: [propertyFormMixin],
    inject: {
      context: { default: {} }
    },
	};
</script>

<style lang="css" scoped>
</style>
