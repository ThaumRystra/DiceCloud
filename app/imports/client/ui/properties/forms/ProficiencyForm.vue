<template lang="html">
  <div class="proficiency-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <proficiency-select
          label="Proficiency"
          style="flex-basis: 300px;"
          :clearable="false"
          :value="model.value"
          @change="change('value', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <smart-toggle
          label="Target properties"
          :value="model.targetByTags ? 'tags' : 'skills'"
          :options="[
            {name: 'Target by variable name', value: 'skills'},
            {name: 'Target by tags', value: 'tags'},
          ]"
          @change="(val, ack) => {
            if (val === 'skills') val = undefined;
            if (val === 'tags') val = true;
            change('targetByTags', val, ack);
          }"
        />
      </v-col>
      <v-col
        cols="12"
      >
        <v-slide-y-transition hide-on-leave>
          <tag-targeting
            v-if="model.targetByTags"
            :model="model"
            :errors="errors"
            @change="e => $emit('change', e)"
            @push="e => $emit('push', e)"
            @pull="e => $emit('pull', e)"
          />
          <smart-combobox
            v-else
            label="Skills"
            class="mr-2"
            multiple
            small-chips
            deletable-chips
            hint="Which skills does this proficiency apply to"
            :value="model.stats"
            :items="skillList"
            :error-messages="errors.stats"
            @change="change('stats', ...arguments)"
          />
        </v-slide-y-transition>
      </v-col>
      <v-expand-transition>
        <v-col
          v-if="model.targetByTags"
          cols="12"
        >
          <text-field
            label="Target field"
            :value="model.targetField"
            hint="Target a specific calculation field on the affected properties"
            placeholder="Default field"
            persistent-placeholder
            :error-messages="errors.targetField"
            @change="change('targetField', ...arguments)"
          />
        </v-col>
      </v-expand-transition>
    </v-row>
    <form-sections
      v-if="$slots.default"
      type="proficiency"
    >
      <slot />
    </form-sections>
  </div>
</template>

<script setup lang="ts">
import { autorun } from 'vue-meteor-tracker';
import ProficiencySelect from '/imports/client/ui/properties/forms/shared/ProficiencySelect.vue';
import TagTargeting from '/imports/client/ui/properties/forms/shared/TagTargeting.vue';
import createListOfProperties from '/imports/client/ui/properties/forms/shared/lists/createListOfProperties';

withDefaults(defineProps<{
  model: Record<string, any>;
  errors?: Record<string, string>;
}>(), { errors: () => ({}) });

const emit = defineEmits(['change']);

function change(path: string | string[], value: any, ack?: Function) {
  const pathArray = Array.isArray(path) ? path : [path];
  emit('change', { path: pathArray, value, ack });
}

const { result: skillList } = autorun(() =>
  createListOfProperties({ type: 'skill' })
);
</script>

<style lang="css" scoped>

</style>
