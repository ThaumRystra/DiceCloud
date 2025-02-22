<template lang="html">
  <div>
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <computed-field
          ref="focusFirst"
          :label="$t('AttributeForm.Nhf3bIPS2M4dn_fb7Dt58')"
          :hint="$t('DamageForm.tKvc9A04tf15QgW5I0HST')"
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
          :label="$t('DamageForm.vSBUWgtZXUz-R3mygeDRb')"
          style="flex-basis: 200px;"
          :hint="$t('DamageForm.Le1gdU0LVDcAb318jQnpZ')"
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
      <v-col cols="12">
        <smart-switch
          class="mt-0"
          :label="$t('DamageForm.elhIUdNqUin0tIr8HPASE')"
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
            :label="$t('DamageForm.K4tBJdCA-IX5x2x7_gFU_')"
            :hint="$t('DamageForm.2ZYkiUwpnuyQEcaxZCnZ6')"
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
            :label="$t('ImageInputDialog.dcbgmuOVYglN2J7VpTBFU')"
            :hint="$t('DamageForm.wLt8NpiVWrumZ9fIkfU6I')"
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
            :label="$t('DamageForm.vn1yigF-QkAGevxOv_hE6')"
            :hint="$t('DamageForm.4T1RVOx5n7MiWgNTFONBl')"
            :placeholder="$t('DamageForm.1wEkuz0UjFyeKTJq_F1cS')"
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
      <form-section :name="$t('ActionForm.7JkrChA5Oz7n_-wF0QxsW')">
        <v-row>
          <v-col cols="12">
            <smart-switch
              :label="$t('ActionForm.pTOkAuMdrx_hGI0E1xQl2')"
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
          if (!value) return this.$t('DamageForm.EnQgqwE5gfzy6PTTjZzY7');
          if (!VARIABLE_NAME_REGEX.test(value)) {
            return this.$t('DamageForm.yn1Bes_MY4pX_6RMi7xQJ', [value])
          }
        }
      ],
    }
  },
  computed: {
    targetOptions() {
      return [
        {
          text: this.$t('ActionForm.wvr48hnF1DbxApmRDC3R0'),
          value: 'self',
        }, {
          text: this.$t('DamageForm.zHu2ur9PIJmRoyqAo7Wmm'),
          value: 'target',
        },
      ];
    },
    targetOptionHint() {
      let hints = {
        self: this.$t('DamageForm.Na3qN3IUrdyG-T4ivcu9E'),
        target: this.$t('DamageForm.u1M7JtjYwhEame-Pp_QOk'),
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
