<template lang="html">
  <v-row dense>
    <v-col
      cols="12"
      md="6"
    >
      <smart-combobox
        :label="$t('AdjustmentForm.GHSISPeV1o-lHDQGal1TZ')"
        :hint="$t('AttributeConsumedForm.FcSQlAAP2P6TS3nRAo--6')"
        style="flex-basis: 300px;"
        :items="attributeList"
        :value="model.variableName"
        :error-messages="errors.variableName"
        @change="change('variableName', ...arguments)"
      />
    </v-col>
    <v-col
      cols="12"
      md="6"
    >
      <computed-field
        :label="$t('AttributeConsumedForm.UmwJU_8ntBz-N8i0UgvKd')"
        :hint="$t('AttributeConsumedForm.0kRTLciPSV-Bjk6RFrzaX')"
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
import attributeListMixin from '/imports/client/ui/properties/forms/shared/lists/attributeListMixin';

export default {
  mixins: [propertyFormMixin, attributeListMixin],
}
</script>
