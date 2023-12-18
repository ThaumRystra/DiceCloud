<template lang="html">
  <div class="saving-throw-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <computed-field
          label="DC"
          hint="Saving throw DC"
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
          label="Save"
          hint="Which stat the saving throw targets"
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
          label="Target creature"
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
import saveListMixin from '/imports/client/ui/properties/forms/shared/lists/saveListMixin';
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';

export default {
  mixins: [saveListMixin, propertyFormMixin],
};
</script>
