<template lang="html">
  <div>
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <computed-field
          ref="focusFirst"
          :label="$t('properties.forms.damageForm.damage')"
          :hint="$t('properties.forms.damageForm.damageHint')"
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
          :label="$t('properties.forms.damageForm.damageType')"
          style="flex-basis: 200px;"
          :hint="$t('properties.forms.damageForm.damageTypeHint')"
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
          :label="$t('properties.forms.damageForm.targetCreature')"
          :value="model.target"
          :options="[
            {name: $t('properties.forms.damageForm.actionTarget'), value: 'target'},
            {name: $t('properties.forms.damageForm.self'), value: 'self'},
          ]"
          :error-messages="errors.target"
          @change="change('target', ...arguments)"
        />
      </v-col>
      <v-col cols="12">
        <smart-switch
          class="mt-0"
          :label="$t('properties.forms.damageForm.savingThrow')"
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
            :label="$t('properties.forms.damageForm.dc')"
            :hint="$t('properties.forms.damageForm.dcHint')"
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
            :label="$t('properties.forms.damageForm.save')"
            :hint="$t('properties.forms.damageForm.saveHint')"
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
            :label="$t('properties.forms.damageForm.damageOnSuccessfulSave')"
            :hint="$t('properties.forms.damageForm.damageOnSuccessfulSaveHint')"
            :placeholder="$t('properties.forms.damageForm.halfDamage')"
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
      <form-section :name="$t('properties.forms.common.log')">
        <v-row>
          <v-col cols="12">
            <smart-switch
              :label="$t('properties.forms.actionForm.dontShowInLog')"
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
