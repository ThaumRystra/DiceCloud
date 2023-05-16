<template lang="html">
  <div class="proficiency-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <smart-combobox
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
      </v-col>
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

export default {
  components: {
    ProficiencySelect,
  },
  mixins: [propertyFormMixin, skillListMixin],
};
</script>

<style lang="css" scoped>

</style>
