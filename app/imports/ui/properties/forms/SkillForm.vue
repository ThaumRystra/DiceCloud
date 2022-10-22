<template lang="html">
  <div class="skill-form">
    <div class="layout wrap">
      <text-field
        ref="focusFirst"
        label="Name"
        :value="model.name"
        :error-messages="errors.name"
        @change="change('name', ...arguments)"
      />
      <text-field
        label="Variable name"
        :value="model.variableName"
        style="flex-basis: 300px;"
        hint="Use this name in formulae to reference this skill"
        :error-messages="errors.variableName"
        @change="change('variableName', ...arguments)"
      />
      <smart-combobox
        label="Ability"
        :value="model.ability"
        style="flex-basis: 300px;"
        hint="Which ability is this skill based off of"
        :items="abilityScoreList"
        :error-messages="errors.ability"
        @change="change('ability', ...arguments)"
      />
    </div>
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

    <inline-computation-field
      label="Description"
      :model="model.description"
      :error-messages="errors.description"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <form-sections>
      <form-section
        v-if="$slots.children"
        name="Children"
      >
        <slot name="children" />
      </form-section>

      <form-section name="Advanced">
        <smart-combobox
          label="Tags"
          multiple
          chips
          deletable-chips
          :value="model.tags"
          @change="change('tags', ...arguments)"
        />
        <div class="layout justify-center">
          <computed-field
            label="Base Value"
            hint="This is the value of the skill before effects are applied"
            :model="model.baseValue"
            :error-messages="errors.baseValue"
            @change="({path, value, ack}) =>
              $emit('change', {path: ['baseValue', ...path], value, ack})"
          />
          <proficiency-select
            style="flex-basis: 300px;"
            label="Base Proficiency"
            :value="model.baseProficiency"
            :error-messages="errors.baseProficiency"
            @change="change('baseProficiency', ...arguments)"
          />
        </div>
      </form-section>
    </form-sections>
  </div>
</template>

<script lang="js">
import ProficiencySelect from '/imports/ui/properties/forms/shared/ProficiencySelect.vue';
import FormSection from '/imports/ui/properties/forms/shared/FormSection.vue';
import createListOfProperties from '/imports/ui/properties/forms/shared/lists/createListOfProperties.js';
import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';

export default {
  components: {
    ProficiencySelect,
    FormSection,
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
