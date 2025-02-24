<template lang="html">
  <v-row dense>
    <v-col
      cols="12"
      md="6"
    >
      <computed-field
        :label="$t('PropertyForm.reKPKGEnAfdHpBLoywE1w')"
        :hint="$t('ActionConditionForm.4MHDOLH7O-fyg2mojtvs7')"
        :model="model.condition"
        :error-messages="errors.condition"
        @change="({path, value, ack}) =>
          $emit('change', {path: ['condition', ...path], value, ack})"
      />
    </v-col>
    <v-col
      cols="12"
      md="6"
    >
      <text-field
        :label="$t('ActionConditionForm.D43JDV2GxwLXXBv68DIyi')"
        :value="model.conditionNote"
        :error-messages="errors.conditionNote"
        @change="(value, ack) => $emit('change', {path: ['conditionNote'], value, ack})"
      />
    </v-col>
  </v-row>
</template>

<script lang="js">
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';

export default {
  mixins: [propertyFormMixin],
}
</script>
