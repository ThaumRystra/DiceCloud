<template lang="html">
  <div class="damage-multiplier-form">
    <v-row dense>
      <v-col
        cols="12"
      >
        <smart-toggle
          label="Multiplier"
          :value="model.value"
          :options="[{
            value: 2,
            name: 'Vulnerability',
          },{
            value: 0.5,
            name: 'Resistance',
          }, {
            value: 0,
            name: 'Immunity',
          }]"
          :error-messages="errors.value"
          @change="change('value', ...arguments)"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12">
        <smart-combobox
          label="Damage Types"
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
        name="Children"
      >
        <slot name="children" />
      </form-section>
      <form-section name="Apply by tag">
        <v-row dense>
          <v-col cols="12">
            <smart-combobox
              label="Tags required"
              hint="Only apply to damage that has all of these tags"
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
              label="Tags excluded"
              hint="Don't apply to damage that has any of these tags"
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

<script setup lang="ts">
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX';
import DAMAGE_TYPES from '/imports/constants/DAMAGE_TYPES';

withDefaults(defineProps<{
  model: Record<string, any>;
  errors?: Record<string, string>;
}>(), { errors: () => ({}) });

const emit = defineEmits(['change']);

function change(path: string | string[], value: any, ack?: Function) {
  const pathArray = Array.isArray(path) ? path : [path];
  emit('change', { path: pathArray, value, ack });
}

const damageTypeRules = [
  (value: string[]) => {
    if (value && value.length) {
      for (let i = 0; i < value.length; i++) {
        if (!VARIABLE_NAME_REGEX.test(value[i])) {
          return `${value[i]} is not a valid damage name`;
        }
      }
    }
  },
];

function error(e: any) {
  console.error(e);
}
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
