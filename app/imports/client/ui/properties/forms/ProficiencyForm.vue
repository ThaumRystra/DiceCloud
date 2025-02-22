<template lang="html">
  <div class="proficiency-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <proficiency-select
          :label="$t('InlineProficiency.jN183F3ufg8Le9jkznJ4p')"
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
          :label="$t('EffectForm.qP3ZqRZPSY87NPXcxXgsk')"
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
            :label="$t('StatsTab._POnH8ne4-_owhYxKHS9I')"
            class="mr-2"
            multiple
            small-chips
            deletable-chips
            :hint="$t('ProficiencyForm.XgrzFtMQF6IfD4jBvGqfA')"
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
            :label="$t('EffectForm.-IBot5cFFVU_fExJi4xIA')"
            :value="model.targetField"
            :hint="$t('EffectForm.C7bO5_RlI0jtDfzqVqgnE')"
            :placeholder="$t('EffectForm.snD8tCJau7JV3nHgF0GuU')"
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

<script lang="js">
import ProficiencySelect from '/imports/client/ui/properties/forms/shared/ProficiencySelect.vue';
import skillListMixin from '/imports/client/ui/properties/forms/shared/lists/skillListMixin';
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';
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
