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
        <v-slide-x-transition mode="out-in">
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
        </v-slide-x-transition>
      </v-col>
    </v-row>
    <form-sections
      v-if="$slots.default"
    >
      <slot />
    </form-sections>
  </div>
</template>

<script lang="js">
import ProficiencySelect from '/imports/client/ui/properties/forms/shared/ProficiencySelect.vue';
import skillListMixin from '/imports/client/ui/properties/forms/shared/lists/skillListMixin.js';
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin.js';
import TagTargeting from '/imports/client/ui/properties/forms/shared/TagTargeting.vue';

export default {
  components: {
    ProficiencySelect,
    TagTargeting,
  },
  mixins: [propertyFormMixin, skillListMixin],
};
</script>

<style lang="css" scoped>

</style>
