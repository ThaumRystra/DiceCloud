<template lang="html">
  <div class="roll-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          :label="$t('AttributeForm.vWQj52YzUPPcXSMEZ6dvh')"
          :value="model.variableName"
          style="flex-basis: 300px;"
          :hint="$t('RollForm.JWuj-egKYGNBCtSDcN9Pp')"
          :error-messages="errors.variableName"
          @change="change('variableName', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <computed-field
          :label="$t('SelectedCreatureBar.NgRLZ1KujlD3o3EtzLY3R')"
          :hint="$t('RollForm.1tJlgrJOlIRP7yDDmCPzA')"
          :model="model.roll"
          :error-messages="errors.roll"
          @change="({path, value, ack}) =>
            $emit('change', {path: ['roll', ...path], value, ack})"
        />
      </v-col>
    </v-row>
    <form-sections type="roll">
      <form-section :name="$t('ActionForm.7JkrChA5Oz7n_-wF0QxsW')">
        <smart-switch
          :label="$t('ActionForm.pTOkAuMdrx_hGI0E1xQl2')"
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
import FormSection, { FormSections } from '/imports/client/ui/properties/forms/shared/FormSection.vue';
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';

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
