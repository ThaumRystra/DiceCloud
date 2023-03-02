<template>
  <div class="feature-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          ref="focusFirst"
          label="Name"
          :value="model.name"
          :error-messages="errors.name"
          @change="change('name', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          label="Variable name"
          :value="model.variableName"
          hint="Use this name in calculations to reference this attribute"
          :error-messages="errors.variableName"
          @change="change('variableName', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <smart-checkbox
          label="Show on character sheet"
          :value="model.showUI"
          :error-messages="errors.showUI"
          @change="change('showUI', ...arguments)"
        />
      </v-col>

      <v-col
        cols="12"
        md="6"
      >
        <v-layout column>
          <v-radio-group
            :value="radioSelection"
            @change="radioChange"
          >
            <v-radio
              value="enabled"
              label="Enabled"
            />
            <v-radio
              value="disabled"
              label="Disabled"
            />
            <v-radio
              value="calculated"
              label="Calculated"
            />
          </v-radio-group>
        </v-layout>
      </v-col>
    </v-row>
    <v-fade-transition>
      <computed-field
        v-show="radioSelection === 'calculated'"
        label="Condition"
        hint="When this calculation returns a value that isn't false or zero the children will be active"
        :model="model.condition"
        :error-messages="errors.condition"
        @change="({path, value, ack}) =>
          $emit('change', {path: ['condition', ...path], value, ack})"
      />
    </v-fade-transition>
    <smart-combobox
      label="Tags"
      multiple
      chips
      deletable-chips
      hint="Used to let slots find this property in a library, should otherwise be left blank"
      :value="model.tags"
      @change="change('tags', ...arguments)"
    />

    <form-section
      v-if="$slots.children"
      name="Children"
      standalone
    >
      <slot name="children" />
    </form-section>
  </div>
</template>

<script>
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin.js';

export default {
  mixins: [propertyFormMixin],
  computed: {
    radioSelection() {
      if (this.model.disabled) {
        return 'disabled';
      } else if (this.model.enabled) {
        return 'enabled'
      } else {
        return 'calculated';
      }
    }
  },
  methods: {
    radioChange(value) {
      if (value === 'enabled') {
        this.$emit('change', { path: ['enabled'], value: true });
        this.$emit('change', { path: ['disabled'], value: false });
      } else if (value === 'disabled') {
        this.$emit('change', { path: ['disabled'], value: true });
        this.$emit('change', { path: ['enabled'], value: false });
      } else if (value === 'calculated') {
        this.$emit('change', { path: ['disabled'], value: false });
        this.$emit('change', { path: ['enabled'], value: false });
      }
    }
  }
};
</script>

<style lang="css" scoped>

</style>
