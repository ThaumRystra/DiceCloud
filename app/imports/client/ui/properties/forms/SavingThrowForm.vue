<template lang="html">
  <div class="saving-throw-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <computed-field
          label="DC"
          :hint="$t('DamageForm.2ZYkiUwpnuyQEcaxZCnZ6')"
          :model="model.dc"
          :error-messages="errors.dc"
          @change="({path, value, ack}) =>
            $emit('change', {path: ['dc', ...path], value, ack})"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <smart-combobox
          :label="$t('ImageInputDialog.dcbgmuOVYglN2J7VpTBFU')"
          :hint="$t('DamageForm.wLt8NpiVWrumZ9fIkfU6I')"
          :value="model.stat"
          :items="saveList"
          :error-messages="errors.stat"
          @change="change('stat', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
      >
        <smart-toggle
          :label="$t('ActionForm.IwoGz7GsJv8SJpY4hizQ8')"
          :value="model.target"
          :options="[
            {name: 'Action Target', value: 'target'},
            {name: 'Self', value: 'self'},
          ]"
          :error-messages="errors.target"
          @change="change('target', ...arguments)"
        />
      </v-col>
    </v-row>
    <form-sections type="savingThrow">
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
import saveListMixin from '/imports/client/ui/properties/forms/shared/lists/saveListMixin';
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';

export default {
  mixins: [saveListMixin, propertyFormMixin],
};
</script>
