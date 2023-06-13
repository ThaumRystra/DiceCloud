<template lang="html">
  <div>
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <computed-field
          ref="focusFirst"
          label="Damage"
          hint="A calculation including dice rolls of the damage to deal to the target when activated by an action"
          :model="model.amount"
          :error-messages="errors.amount"
          @change="({path, value, ack}) =>
            $emit('change', {path: ['amount', ...path], value, ack})"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <smart-combobox
          label="Damage Type"
          style="flex-basis: 200px;"
          hint="Use the Healing type to restore hit points"
          :rules="damageTypeRules"
          :items="DAMAGE_TYPES"
          :value="model.damageType"
          :error-messages="errors.damageType"
          :menu-props="{auto: true}"
          @change="change('damageType', ...arguments)"
        />
      </v-col>
    </v-row>
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
    <form-sections type="damage">
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
import DAMAGE_TYPES from '/imports/constants/DAMAGE_TYPES.js';
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin.js';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX.js';

export default {
  mixins: [propertyFormMixin],
  props: {
    parentTarget: {
      type: String,
      default: undefined,
    },
  },
  data() {
    return {
      DAMAGE_TYPES,
      damageTypeRules: [
        value => {
          if (!value) return 'Damage type is required';
          if (!VARIABLE_NAME_REGEX.test(value)) {
            return `${value} is not a valid damage name`
          }
        }
      ],
    }
  },
  computed: {
    targetOptions() {
      return [
        {
          text: 'Self',
          value: 'self',
        }, {
          text: 'Target',
          value: 'target',
        },
      ];
    },
    targetOptionHint() {
      let hints = {
        self: 'The damage will be applied to the character taking the action',
        target: 'The damage will be applied to the target of the action',
      };
      return hints[this.model.target];
    }
  },
}
</script>

<style lang="css" scoped>

</style>
