<template lang="html">
  <div class="class-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          label="Class variable name"
          :value="model.variableName"
          style="flex-basis: 300px;"
          hint="This should be the same as the class's variable name"
          :error-messages="errors.variableName"
          @change="change('variableName', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          label="Level"
          type="number"
          class="base-value-field text-center large-format no-flex"
          :value="model.level"
          :error-messages="errors.level"
          @change="change('level', ...arguments)"
        />
      </v-col>
    </v-row>

    <inline-computation-field
      label="Description"
      hint="A brief description of what this class level gives a character"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />
    <form-sections
      v-if="$slots.default"
      type="classLevel"
    >
      <slot />
    </form-sections>
  </div>
</template>

<script lang="js">
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';

export default {
  mixins: [propertyFormMixin],
};
</script>

<style lang="css" scoped>

</style>
