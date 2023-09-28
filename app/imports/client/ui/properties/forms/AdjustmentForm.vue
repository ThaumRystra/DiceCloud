<template lang="html">
  <div class="adjustment-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <smart-combobox
          label="Attribute"
          hint="The attribute that will be damaged or healed"
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
          label="Amount"
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
          label="Operation"
          hint="Should the attribute be damaged by the amount, or set to the amount"
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
    <form-sections type="adjustment">
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
import attributeListMixin from '/imports/client/ui/properties/forms/shared/lists/attributeListMixin';
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';

export default {
  mixins: [propertyFormMixin, attributeListMixin],
  data() {
    return {
      damageHint: 'The amount of damage to apply, negative values will heal',
      setHint: 'The value to set the stat to',
    }
  },
}
</script>

<style lang="css" scoped>

</style>
