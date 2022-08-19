<template lang="html">
  <div class="buff-form">
    <text-field
      ref="focusFirst"
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      @change="change('name', ...arguments)"
    />
    <inline-computation-field
      label="Description"
      :model="model.description"
      :error-messages="errors.description"
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
    <v-expand-transition>
      <smart-select
        v-if="!model.applied"
        label="Target"
        :items="targetOptions"
        :value="model.target"
        :error-messages="errors.target"
        :menu-props="{auto: true, lazy: true}"
        @change="change('target', ...arguments)"
      />
    </v-expand-transition>
    <form-sections>
      <form-section
        v-if="$slots.children"
        name="Children"
        standalone
      >
        <slot name="children" />
      </form-section>
      <form-section
        name="Advanced"
      >
        <smart-switch
          label="Hide remove button"
          :value="model.hideRemoveButton"
          :error-messages="errors.hideRemoveButton"
          @change="change('hideRemoveButton', ...arguments)"
        />
        <smart-combobox
          label="Tags"
          multiple
          chips
          deletable-chips
          hint="Used to let slots find this property in a library, should otherwise be left blank"
          :value="model.tags"
          @change="change('tags', ...arguments)"
        />
      </form-section>
    </form-sections>
  </div>
</template>

<script lang="js">
  import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';

	export default {
    mixins: [propertyFormMixin],
    data(){return {
      targetOptions: [
        {
          text: 'Self',
          value: 'self',
        }, {
          text: 'Target',
          value: 'target',
        },
      ],
    }},
	}
</script>

<style lang="css" scoped>
</style>
