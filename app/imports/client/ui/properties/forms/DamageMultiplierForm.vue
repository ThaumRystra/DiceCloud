<template lang="html">
  <div class="damage-multiplier-form">
    <v-row dense>
      <v-col
        cols="12"
      >
        <smart-toggle
          :label="$t('DamageMultiplierForm.M3x4lMUUK8hPMBunTeJKW')"
          :value="model.value"
          :options="[{
            value: 2,
            name: $t('PrintedDamageMultipliers.p5oBcNFeC2ebcPTxmWvab'),
          },{
            value: 0.5,
            name: $t('PrintedDamageMultipliers.uP77KRfYo25L_qwnj-JQR'),
          }, {
            value: 0,
            name: $t('PrintedDamageMultipliers.uNx-Dyhk3Z17Q7dWuR4Bp'),
          }]"
          :error-messages="errors.value"
          @change="change('value', ...arguments)"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12">
        <smart-combobox
          :label="$t('DamageMultiplierForm.uSIuxHLCTocxiiJ5q3abK')"
          multiple
          chips
          deletable-chips
          :rules="damageTypeRules"
          :items="DAMAGE_TYPES"
          :value="model.damageTypes"
          :error-messages="errors.damageTypes"
          :menu-props="{auto: true, lazy: true}"
          @update:error="error"
          @change="change('damageTypes', ...arguments)"
        />
      </v-col>
    </v-row>
    <form-sections type="damageMultiplier">
      <form-section
        v-if="$slots.children"
        :name="$t('BuffRemoverForm.mfgWVnzACJzVST8OLqhdo')"
      >
        <slot name="children" />
      </form-section>
      <form-section :name="$t('DamageMultiplierForm.NgRyI3HHHG2iNgaWW1sfO')">
        <v-row dense>
          <v-col cols="12">
            <smart-combobox
              :label="$t('DamageMultiplierForm.M7PrptCUqUxPZ7iWpme1O')"
              :hint="$t('DamageMultiplierForm.DtSkXDBKCytH1PP8OOCYO')"
              multiple
              small-chips
              deletable-chips
              persistent-hint
              :items="['magical', 'silvered']"
              :value="model.includeTags"
              @change="change('includeTags', ...arguments)"
            />
          </v-col>
          <v-col cols="12">
            <smart-combobox
              :label="$t('DamageMultiplierForm.Dx09c5by0x2vyTqYHwR75')"
              :hint="$t('DamageMultiplierForm.FfK6vlC9tBsHSLQLI1Wll')"
              multiple
              small-chips
              deletable-chips
              persistent-hint
              :items="['magical', 'silvered']"
              :value="model.excludeTags"
              @change="change('excludeTags', ...arguments)"
            />
          </v-col>
        </v-row>
      </form-section>
      <slot />
    </form-sections>
  </div>
</template>

<script lang="js">
import FormSection, { FormSections } from '/imports/client/ui/properties/forms/shared/FormSection.vue';
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX';
import DAMAGE_TYPES from '/imports/constants/DAMAGE_TYPES';

export default {
  components: {
    FormSections,
    FormSection,
  },
  mixins: [propertyFormMixin],
  data() {
    return {
      DAMAGE_TYPES,
      damageTypeRules: [
        value => {
          if (value && value.length) {
            for (let i = 0; i < value.length; i++) {
              if (!VARIABLE_NAME_REGEX.test(value[i])) {
                return this.$t('DamageMultiplierForm.AMAn3Zqxk3uTILNZ9tBHL', [value[i]])
              }
            }
          }
        }
      ],
    };
  },
  methods: {
    error(e) {
      console.error(e)
    }
  }
};
</script>

<style lang="css" scoped>
.no-flex {
  flex: initial;
}

.layout.row.wrap {
  margin-right: -8px;
}

.layout.row.wrap>* {
  margin-right: 8px;
}
</style>
