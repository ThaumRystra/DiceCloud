<template lang="html">
  <div class="buff-form">
    <inline-computation-field
      label="Description"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <!-- Duration not implemented yet
    <computed-field
      label="Duration"
      hint="How many rounds the buff lasts"
      :model="model.duration"
      :error-messages="errors.duration"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['duration', ...path], value, ack})"
    />
    -->
    <smart-toggle
      v-if="!model.applied"
      label="Target creature"
      :value="model.target"
      :options="[
        {name: 'Action Target', value: 'target'},
        {name: 'Self', value: 'self'},
      ]"
      :error-messages="errors.target"
      @change="change('target', ...arguments)"
    />
    <form-sections type="buff">
      <form-section
        v-if="$slots.children"
        name="Children"
        standalone
      >
        <slot name="children" />
      </form-section>
      <form-section name="Behavior">
        <v-row dense>
          <v-col
            cols="12"
            sm="6"
            md="4"
          >
            <smart-switch
              label="Hide remove button"
              :value="model.hideRemoveButton"
              :error-messages="errors.hideRemoveButton"
              @change="change('hideRemoveButton', ...arguments)"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
            md="4"
          >
            <smart-switch
              label="Don't freeze variables"
              :value="model.skipCrystalization"
              :error-messages="errors.skipCrystalization"
              @change="change('skipCrystalization', ...arguments)"
            />
          </v-col>
        </v-row>
      </form-section>
      <form-section name="Log">
        <smart-switch
          label="Don't show in log"
          :value="model.silent"
          :error-messages="errors.silent"
          @change="change('silent', ...arguments)"
        />
      </form-section>
      <slot />
    </form-sections>
  </div>
</template>

<script lang="js">
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';

export default {
  mixins: [propertyFormMixin],
}
</script>

<style lang="css" scoped>

</style>
