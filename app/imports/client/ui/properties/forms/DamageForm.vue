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
      <v-col cols="12">
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
      <v-col cols="12">
        <smart-switch
          class="mt-0"
          label="Saving throw"
          :value="!!model.save"
          :error-messages="errors.save"
          @change="(val, ack) => $emit('change', {
            path: ['save'],
            value: val ? {} : undefined,
            ack
          })"
        />
      </v-col>
    </v-row>
    <v-expand-transition>
      <v-row
        v-if="model.save"
        dense
      >
        <v-col
          cols="12"
          md="6"
        >
          <computed-field
            label="DC"
            hint="Saving throw DC"
            :model="model.save.dc"
            :error-messages="errors['save.dc']"
            @change="({path, value, ack}) =>
              $emit('change', {path: ['save', 'dc', ...path], value, ack})"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <smart-combobox
            label="Save"
            hint="Which stat the saving throw targets"
            :value="model.save.stat"
            :items="saveList"
            :error-messages="errors['save.stat']"
            @change="(value, ack) =>
              $emit('change', {path: ['save', 'stat'], value, ack})"
          />
        </v-col>
        <v-col cols="12">
          <computed-field
            v-if="!!model.save"
            label="Damage on successful save"
            hint="Use &quot;~damage&quot; to reference the damage that would normally be dealt"
            placeholder="Half damage"
            persistent-placeholder
            :model="model.save.damageFunction"
            :error-messages="errors['save.damageFunction']"
            @change="({path, value, ack}) =>
              $emit('change', {path: ['save', 'damageFunction', ...path], value, ack})"
          />
        </v-col>
      </v-row>
    </v-expand-transition>
    <form-sections type="damage">
      <form-section name="Log">
        <v-row>
          <v-col cols="12">
            <smart-switch
              label="Don't show in log"
              :value="model.silent"
              :error-messages="errors.silent"
              @change="change('silent', ...arguments)"
            />
          </v-col>
        </v-row>
      </form-section>
      <slot />
    </form-sections>
  </div>
</template>

<script lang="js">
import DAMAGE_TYPES from '/imports/constants/DAMAGE_TYPES';
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX';
import saveListMixin from '/imports/client/ui/properties/forms/shared/lists/saveListMixin';

export default {
  mixins: [propertyFormMixin, saveListMixin],
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
  methods: {
    saveChange({ path, value, ack }) {
      this.$emit('change', {path: [ 'save', ...path ], value, ack})
      this.$emit('change', {path: [ 'silent' ], value: true, ack})
    },
  },
}
</script>

<style lang="css" scoped>

</style>
