<template>
  <div class="roll-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
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
          style="flex-basis: 300px;"
          hint="Use this name in action formulae to refer to the result of this roll"
          :error-messages="errors.variableName"
          @change="change('variableName', ...arguments)"
        />
      </v-col>
    </v-row>
    <computed-field
      label="Roll"
      hint="The calculation that will be evaluated when the roll is triggered by an action. The result will be saved as the variable name in the context of the roll."
      :model="model.roll"
      :error-messages="errors.roll"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['roll', ...path], value, ack})"
    />
    <form-sections>
      <form-section
        v-if="$slots.children"
        name="Children"
      >
        <slot name="children" />
      </form-section>

      <form-section name="Advanced">
        <v-row dense>
          <v-col
            cols="12"
            sm="6"
            md="4"
          >
            <smart-switch
              label="Don't show in log"
              :value="model.silent"
              :error-messages="errors.silent"
              @change="change('silent', ...arguments)"
            />
          </v-col>
        </v-row>
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

<script>
import FormSection, { FormSections } from '/imports/client/ui/properties/forms/shared/FormSection.vue';
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin.js';

export default {
  components: {
    FormSection,
    FormSections,
  },
  mixins: [propertyFormMixin],
  data() {
    return {
      addResultLoading: false,
    }
  },
  methods: {
    acknowledgeAddResult() {
      this.addResultLoading = false;
    },
  },
};
</script>

<style lang="css" scoped>
.no-flex {
  flex: initial;
}

.layout.row.wrap {
  margin-right: -8px;
}

.layout.row.wrap>* {
  margin-right: 8px;
}
</style>
