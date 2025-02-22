<template lang="html">
  <div class="adjustment-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <smart-combobox
          :label="$t('AdjustmentForm.GHSISPeV1o-lHDQGal1TZ')"
          :hint="$t('AdjustmentForm.v0y3nqMHVe0yEqxsRQSvV')"
          style="flex-basis: 300px;"
          :items="attributeList"
          :value="model.stat"
          :error-messages="errors.stat"
          @change="change('stat', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <computed-field
          :label="$t('AdjustmentForm.AndV_m2mK4EKCnXer50C8')"
          :hint="$t('AdjustmentForm.EvtwZAc19U5OS5op-Q9I8',model.operation === `set` ? setHint : damageHint)"
          :model="model.amount"
          :error-messages="errors.amount"
          @change="({path, value, ack}) =>
            $emit('change', {path: ['amount', ...path], value, ack})"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <smart-toggle
          :label="$t('AdjustmentForm.a3GneFZJ3MOMwzxGWJgMq')"
          :hint="$t('AdjustmentForm.mBh1ceJrKc1DtmJldSJ-X')"
          :value="model.operation"
          :options="[
            { name: 'Damage', value: 'increment' },
            { name: 'Set', value: 'set' },
          ]"
          :error-messages="errors.operation"
          @change="change('operation', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
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
    <form-sections type="adjustment">
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
import attributeListMixin from '/imports/client/ui/properties/forms/shared/lists/attributeListMixin';
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';

export default {
  mixins: [propertyFormMixin, attributeListMixin],
  data() {
    return {
      damageHint: this.$t('AdjustmentForm.4pXn24qlhOEF6vsh4xKOF'),
      setHint: this.$t('AdjustmentForm.ZwwCxikfNMJtWSce4UeGm'),
    }
  },
}
</script>

<style lang="css" scoped>

</style>
