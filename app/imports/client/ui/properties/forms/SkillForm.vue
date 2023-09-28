<template lang="html">
  <div class="skill-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          label="Variable name"
          :value="model.variableName"
          style="flex-basis: 300px;"
          hint="Use this name in formulae to reference this skill"
          :error-messages="errors.variableName"
          @change="change('variableName', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <smart-combobox
          label="Ability"
          :value="model.ability"
          style="flex-basis: 300px;"
          hint="Which ability is this skill based off of"
          :items="abilityScoreList"
          :error-messages="errors.ability"
          @change="change('ability', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <smart-select
          label="Type"
          clearable
          :items="skillTypes"
          :value="model.skillType"
          :error-messages="errors.skillType"
          :menu-props="{auto: true, lazy: true}"
          :hint="skillTypeHints[model.skillType]"
          @change="change('skillType', ...arguments)"
        />
      </v-col>
    </v-row>
    <inline-computation-field
      label="Description"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <form-sections type="skill">
      <form-section name="Base Values">
        <v-row dense>
          <v-col
            cols="12"
            md="6"
          >
            <proficiency-select
              label="Base Proficiency"
              :value="model.baseProficiency"
              :error-messages="errors.baseProficiency"
              @change="change('baseProficiency', ...arguments)"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <computed-field
              label="Base Value"
              hint="This is the value of the skill before effects are applied"
              :model="model.baseValue"
              :error-messages="errors.baseValue"
              @change="({path, value, ack}) =>
                $emit('change', {path: ['baseValue', ...path], value, ack})"
            />
          </v-col>
        </v-row>
      </form-section>
      <form-section name="Apply skill">
        <smart-switch
          label="Apply skill to targeted tags"
          :value="model.targetByTags"
          :error-messages="errors.targetByTags"
          @change="change('targetByTags', ...arguments)"
        />
        <v-expand-transition>
          <tag-targeting
            v-if="model.targetByTags"
            :model="model"
            :errors="errors"
            @change="e => $emit('change', e)"
            @push="e => $emit('push', e)"
            @pull="e => $emit('pull', e)"
          />
        </v-expand-transition>
      </form-section>
      <slot />
    </form-sections>
  </div>
</template>

<script lang="js">
import ProficiencySelect from '/imports/client/ui/properties/forms/shared/ProficiencySelect.vue';
import FormSection from '/imports/client/ui/properties/forms/shared/FormSection.vue';
import createListOfProperties from '/imports/client/ui/properties/forms/shared/lists/createListOfProperties';
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';
import TagTargeting from '/imports/client/ui/properties/forms/shared/TagTargeting.vue';

export default {
  components: {
    ProficiencySelect,
    FormSection,
    TagTargeting,
  },
  mixins: [propertyFormMixin],
  data() {
    return {
      skillTypes: [
        {
          text: 'Skill',
          value: 'skill',
        }, {
          text: 'Save',
          value: 'save',
        }, {
          text: 'Check',
          value: 'check',
        }, {
          text: 'Tool',
          value: 'tool',
        }, {
          text: 'Weapon',
          value: 'weapon',
        }, {
          text: 'Armor',
          value: 'armor',
        }, {
          text: 'Language',
          value: 'language',
        }, {
          text: 'Utility',
          value: 'utility',
        },
      ],
      skillTypeHints: {
        skill: 'A normal character sheet skill like Athletics, Deception, or Investigation',
        'save': 'A saving throw the character can make: Strength Save, etc.',
        'check': 'An ability check that might include a proficiency bonus later eg. Initiative',
        'tool': 'A tool proficiency. Be sure to add a base proficiency in the advanced section.',
        'weapon': 'A weapon proficiency. Be sure to add a base proficiency in the advanced section.',
        'armor': 'A armor proficiency. Be sure to add a base proficiency in the advanced section.',
        'language': 'A language proficiency. Be sure to add a base proficiency in the advanced section.',
        'utility': 'A skill that does not show up in the sheet, but can be used by other caclulations',
      }
    };
  },
  meteor: {
    abilityScoreList() {
      return createListOfProperties({
        type: 'attribute',
        attributeType: 'ability',
      });
    },
  },
};
</script>

<style lang="css" scoped>

</style>
