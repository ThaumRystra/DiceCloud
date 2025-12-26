<template lang="html">
  <div class="adjustment-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <smart-combobox
          :label="$t('properties.forms.adjustmentForm.attribute')"
          :hint="$t('properties.forms.adjustmentForm.attributeHint')"
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
          :label="$t('properties.forms.adjustmentForm.amount')"
          :hint="model.operation === 'set' ? setHint : damageHint"
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
          :label="$t('properties.forms.adjustmentForm.operation')"
          :hint="$t('properties.forms.adjustmentForm.operationHint')"
          :value="model.operation"
          :options="[
            { name: $t('properties.forms.adjustmentForm.damageOption'), value: 'increment' },
            { name: $t('properties.forms.adjustmentForm.setOption'), value: 'set' },
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
    <form-sections type="adjustment">
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
import attributeListMixin from '/imports/client/ui/properties/forms/shared/lists/attributeListMixin';
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';

export default {
  mixins: [propertyFormMixin, attributeListMixin],
  data() {
    return {
      damageHint: this.$t('properties.forms.adjustmentForm.damageHint'),
      setHint: this.$t('properties.forms.adjustmentForm.setHint'),
    }
  },
}
</script>

<style lang="css" scoped>

</style>
