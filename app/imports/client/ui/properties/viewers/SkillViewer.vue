<template lang="html">
  <div class="skill-viewer">
    <v-row
      dense
      justify="center"
      justify-sm="start"
    >
      <property-field
        v-if="model.value !== undefined"
        center
        large
        name="Roll bonus"
        :value="isFinite(model.value) ?
          numberToSignedString(model.value) :
          model.value"
      />
      <property-field
        v-if="model.proficiency !== undefined"
        name="Proficiency"
      >
        <v-icon
          style="height: 12px"
          class="ml-1 mr-2"
        >
          {{ icon }}
        </v-icon>
        <div>
          {{ proficiencyText[model.proficiency] }}
        </div>
      </property-field>
      <property-field
        name="Variable Name"
        mono
        :value="model.variableName"
      />
      <property-field
        name="Ability"
        mono
        :value="model.ability"
      />
      <property-field
        name="Skill type"
        :value="skillTypes[model.skillType]"
      />
      <property-field
        v-if="'passiveBonus' in model"
        name="Passive score"
        :value="passiveScore"
      />
      <property-field
        v-if="model.overridden"
        :cols="{cols: 6, md: 12}"
        name="Overridden"
        value="Overriden by another property with the same variable name"
      />
      <property-target-tags
        :model="model"
      />
    </v-row>
    <v-row dense>
      <property-description
        name="description"
        :model="model.description"
      />
    </v-row>
    <v-row
      v-if="ability || (effects && effects.length)"
      dense
    >
      <property-field
        :cols="{col: 12}"
        name="Effects"
      >
        <v-list style="width: 100%">
          <attribute-effect
            v-if="ability"
            :key="ability._id"
            :model="ability"
            :data-id="ability._id"
            @click="clickEffect(ability._id)"
          />
          <attribute-effect
            v-for="effect in effects"
            :key="effect._id"
            :model="effect"
            :data-id="effect._id"
            @click="clickEffect(effect._id)"
          />
        </v-list>
      </property-field>
    </v-row>
    <v-row
      v-if="baseProficiencies.length || proficiencies.length"
      dense
    >
      <property-field
        :cols="{col: 12}"
        name="Proficiencies"
      >
        <v-list style="width: 100%">
          <skill-proficiency
            v-for="proficiency in baseProficiencies"
            :key="proficiency._id"
            :model="proficiency"
            :proficiency-bonus="proficiencyBonus"
            :hide-breadcrumbs="proficiency._id === model._id"
            :data-id="proficiency._id"
            @click="clickEffect(proficiency._id)"
          />
          <skill-proficiency
            v-for="proficiency in proficiencies"
            :key="proficiency._id"
            :model="proficiency"
            :proficiency-bonus="proficiencyBonus"
            :data-id="proficiency._id"
            @click="clickEffect(proficiency._id)"
          />
        </v-list>
      </property-field>
    </v-row>
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin.js';
import numberToSignedString from '../../../../api/utility/numberToSignedString.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import AttributeEffect from '/imports/client/ui/properties/components/attributes/AttributeEffect.vue';
import SkillProficiency from '/imports/client/ui/properties/components/skills/SkillProficiency.vue';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables.js';
import getProficiencyIcon from '/imports/client/ui/utility/getProficiencyIcon.js';
import sortEffects from '/imports/client/ui/utility/sortEffects.js';
import PropertyTargetTags from '/imports/client/ui/properties/viewers/shared/PropertyTargetTags.vue';

export default {
  components: {
    AttributeEffect,
    SkillProficiency,
    PropertyTargetTags,
  },
  mixins: [propertyViewerMixin],
  inject: {
    context: { default: {} }
  },
  data() {
    return {
      proficiencyText: {
        0: 'Not proficient',
        1: 'Proficient',
        0.49: 'Half proficiency bonus rounded down',
        0.5: 'Half proficiency bonus rounded up',
        2: 'Double proficiency bonus',
      },
      skillTypes: {
        skill: 'Skill',
        save: 'Save',
        check: 'Check',
        tool: 'Tool',
        weapon: 'Weapon',
        armor: 'Armor',
        language: 'Language',
        utility: 'Utility',
      },
    }
  },
  computed: {
    displayedModifier() {
      let mod = this.model.value;
      if (this.model.fail) {
        return 'fail';
      } else {
        return numberToSignedString(mod);
      }
    },
    icon() {
      return getProficiencyIcon(this.model.proficiency);
    },
    passiveScore() {
      return 10 + this.model.value + this.model.passiveBonus;
    },
    effects() {
      return sortEffects(this.model.effects);
    },
  },
  methods: {
    numberToSignedString,
    isFinite: Number.isFinite,
    clickEffect(id) {
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `${id}`,
        data: { _id: id },
      });
    },
  },
  meteor: {
    variables() {
      return CreatureVariables.findOne({ _creatureId: this.context.creatureId }) || {};
    },
    baseProficiencies() {
      if (this.context.creatureId) {
        let creatureId = this.context.creatureId;
        return CreatureProperties.find({
          'ancestors.id': creatureId,
          type: 'skill',
          variableName: this.model.variableName,
          removed: { $ne: true },
          inactive: { $ne: true },
        }).map(prop => ({
          _id: prop._id,
          name: 'Skill base proficiency',
          value: prop.baseProficiency,
          stats: [prop.variableName],
          ancestors: prop.ancestors,
        })).filter(prof => prof.value);
      } else {
        return [];
      }
    },
    proficiencies() {
      let creatureId = this.context.creatureId;
      if (creatureId) {
        return CreatureProperties.find({
          'ancestors.id': creatureId,
          stats: this.model.variableName,
          type: 'proficiency',
          removed: { $ne: true },
          inactive: { $ne: true },
        }).fetch();
      } else {
        return [];
      }
    },
    ability() {
      let creatureId = this.context.creatureId;
      let ability = this.model.ability;
      if (!creatureId || !ability) return;
      let abilityProp = CreatureProperties.findOne({
        'ancestors.id': creatureId,
        variableName: ability,
        type: 'attribute',
        removed: { $ne: true },
        inactive: { $ne: true },
        overridden: { $ne: true },
      });
      if (!abilityProp) return;
      return {
        _id: abilityProp._id,
        name: abilityProp.name,
        operation: 'add',
        amount: { value: abilityProp.modifier },
        stats: [this.model.variableName],
        ancestors: abilityProp.ancestors,
      }
    },
    proficiencyBonus() {
      let creatureId = this.context.creatureId;
      if (!creatureId) return;
      return this.variables.proficiencyBonus &&
        this.variables.proficiencyBonus.value;
    },
  },
}
</script>

<style lang="css" scoped>

</style>
