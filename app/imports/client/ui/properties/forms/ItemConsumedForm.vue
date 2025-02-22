<template lang="html">
  <v-row dense>
    <v-col
      cols="12"
      md="6"
    >
      <text-field
        :label="$t('ItemConsumedForm.ZNi2pRgWHJ9mG8GR0jSv5')"
        :hint="$t('ItemConsumedForm.fx2euWM0B_hEtzWk9-XXS')"
        style="flex-basis: 300px;"
        :value="model.tag"
        :error-messages="errors.tag"
        @change="change('tag', ...arguments)"
      />
    </v-col>
    <v-col
      cols="12"
      md="6"
    >
      <computed-field
        :label="$t('AttributeConsumedForm.UmwJU_8ntBz-N8i0UgvKd')"
        :hint="$t('ItemConsumedForm.cdlMdmMAJ6I5CbT27PDB-')"
        style="flex-basis: 300px;"
        :model="model.quantity"
        :error-messages="errors.quantity"
        @change="({path, value, ack}) =>
          $emit('change', {path: ['quantity', ...path], value, ack})"
      />
    </v-col>
  </v-row>
</template>

<script lang="js">
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';

export default {
  mixins: [propertyFormMixin],
};
</script>
