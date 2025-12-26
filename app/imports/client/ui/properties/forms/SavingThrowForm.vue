<template lang="html">
  <div class="saving-throw-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <computed-field
          :label="$t('properties.forms.savingThrowForm.dc')"
          :hint="$t('properties.forms.savingThrowForm.dcHint')"
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
          :label="$t('properties.forms.savingThrowForm.save')"
          :hint="$t('properties.forms.savingThrowForm.saveHint')"
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
          :label="$t('properties.forms.savingThrowForm.targetCreature')"
          :value="model.target"
          :options="[
            {name: $t('properties.forms.savingThrowForm.actionTarget'), value: 'target'},
            {name: $t('properties.forms.savingThrowForm.self'), value: 'self'},
          ]"
          :error-messages="errors.target"
          @change="change('target', ...arguments)"
        />
      </v-col>
    </v-row>
    <form-sections type="savingThrow">
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
import saveListMixin from '/imports/client/ui/properties/forms/shared/lists/saveListMixin';
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';

export default {
  mixins: [saveListMixin, propertyFormMixin],
};
</script>
