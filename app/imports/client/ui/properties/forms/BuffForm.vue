<template lang="html">
  <div class="buff-form">
    <inline-computation-field
      :label="$t('properties.forms.common.description')"
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
      :label="$t('properties.forms.buffForm.targetCreature')"
      :value="model.target"
      :options="[
        {name: $t('properties.forms.buffForm.actionTarget'), value: 'target'},
        {name: $t('properties.forms.buffForm.self'), value: 'self'},
      ]"
      :error-messages="errors.target"
      @change="change('target', ...arguments)"
    />
    <form-sections type="buff">
      <form-section
        v-if="$slots.children"
        :name="$t('properties.forms.buffForm.children')"
        standalone
      >
        <slot name="children" />
      </form-section>
      <form-section :name="$t('properties.forms.common.behavior')">
        <v-row dense>
          <v-col
            cols="12"
            sm="6"
            md="4"
          >
            <smart-switch
              :label="$t('properties.forms.buffForm.hideRemoveButton')"
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
              :label="$t('properties.forms.buffForm.dontFreezeVariables')"
              :value="model.skipCrystalization"
              :error-messages="errors.skipCrystalization"
              @change="change('skipCrystalization', ...arguments)"
            />
          </v-col>
        </v-row>
      </form-section>
      <form-section :name="$t('properties.forms.common.log')">
        <smart-switch
          :label="$t('properties.forms.actionForm.dontShowInLog')"
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
