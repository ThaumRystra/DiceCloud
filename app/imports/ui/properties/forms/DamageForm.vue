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
          hint="A caculation including dice rolls of the damge to deal to the target when activated by an action"
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
    <smart-select
      label="Target"
      :hint="targetOptionHint"
      :items="targetOptions"
      :value="model.target"
      :error-messages="errors.target"
      :menu-props="{auto: true, lazy: true}"
      @change="change('target', ...arguments)"
    />
    <smart-combobox
      label="Tags"
      class="mr-2"
      multiple
      chips
      deletable-chips
      hint=""
      :items="['magical', 'silvered', 'ignore resistance', 'ignore vulnerability', 'ignore immunity']"
      :value="model.tags"
      :error-messages="errors.tags"
      @change="change('tags', ...arguments)"
    />
    <smart-switch
      label="Don't show in log"
      :value="model.silent"
      :error-messages="errors.silent"
      @change="change('silent', ...arguments)"
    />
    <form-section
      v-if="$slots.children"
      name="Children"
      standalone
    >
      <slot name="children" />
    </form-section>
  </div>
</template>

<script lang="js">
import DAMAGE_TYPES from '/imports/constants/DAMAGE_TYPES.js';
import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';
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
