<template lang="html">
  <div class="skill-viewer">
    <v-layout
      column
      align-center
    >
      <div
        v-if="model.value !== undefined"
        class="text-h4 layout align-center"
      >
        <v-icon class="mr-4">
          {{ icon }}
        </v-icon>
        <div v-if="isFinite(model.value)">
          {{ numberToSignedString(model.value) }}
        </div>
      </div>
    </v-layout>
    <property-name :value="model.name" />
    <property-variable-name :value="model.variableName" />
    <property-field
      name="Ability"
      :value="model.ability"
    />
    <property-field
      name="Type"
      :value="model.skillType"
    />
    <property-field
      name="Base value"
      :value="model.baseValue"
    />
    <property-field
      name="Base proficiency"
      :value="model.baseProficiency"
    />
    <property-description
      :string="model.description"
      :calculations="model.descriptionCalculations"
      :inactive="model.inactive"
    />

    <attribute-effect
      v-for="effect in baseEffects"
      :key="effect._id"
      :model="effect"
      :hide-breadcrumbs="effect._id === model._id"
      :data-id="effect._id"
      @click="effect._id !== model._id && clickEffect(effect._id)"
    />
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
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js';
import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import AttributeEffect from '/imports/ui/properties/components/attributes/AttributeEffect.vue';
import SkillProficiency from '/imports/ui/properties/components/skills/SkillProficiency.vue';
import Creatures from '/imports/api/creature/Creatures.js';

export default {
  components: {
    AttributeEffect,
    SkillProficiency,
  },
	mixins: [propertyViewerMixin],
  inject: {
    context: { default: {} }
  },
  computed: {
    displayedModifier(){
			let mod = this.model.value;
			if (this.model.fail){
				return 'fail';
			} else {
				return numberToSignedString(mod);
			}
		},
    icon(){
			if (this.model.proficiency == 0.49){
				return 'brightness_3';
			} else if (this.model.proficiency == 0.5){
				return 'brightness_2';
			} else if (this.model.proficiency == 1) {
				return 'brightness_1'
			} else if (this.model.proficiency == 2){
				return 'album'
			} else {
				return 'radio_button_unchecked';
			}
		},
  },
  methods: {
    numberToSignedString,
    isFinite: Number.isFinite,
    clickEffect(id){
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `${id}`,
        data: {_id: id},
      });
    },
  },
  meteor: {
    baseEffects(){
      if (this.context.creatureId){
        let creatureId = this.context.creatureId;
        return CreatureProperties.find({
          'ancestors.id': creatureId,
          type: 'attribute',
          variableName: this.model.variableName,
          removed: {$ne: true},
          inactive: {$ne: true},
        }).map( prop => ({
          _id: prop._id,
          name: 'Skill base value',
          operation: 'base',
          calculation: prop.baseValueCalculation,
          result: prop.baseValue,
          stats: [prop.variableName],
          ancestors: prop.ancestors,
        }) ).filter(effect => effect.result);
      } else {
        return [];
      }
    },
    effects(){
      if (this.context.creatureId){
        let creatureId = this.context.creatureId;
        return CreatureProperties.find({
          'ancestors.id': creatureId,
          stats: this.model.variableName,
          type: 'effect',
          removed: {$ne: true},
        });
      } else {
        return [];
      }
    },
    baseProficiencies(){
      if (this.context.creatureId){
        let creatureId = this.context.creatureId;
        return CreatureProperties.find({
          'ancestors.id': creatureId,
          type: 'skill',
          variableName: this.model.variableName,
          removed: {$ne: true},
          inactive: {$ne: true},
        }).map( prop => ({
          _id: prop._id,
          name: 'Skill base proficiency',
          value: prop.baseProficiency,
          stats: [prop.variableName],
          ancestors: prop.ancestors,
        }) ).filter(prof => prof.value);
      } else {
        return [];
      }
    },
    proficiencies(){
      let creatureId = this.context.creatureId;
      if (creatureId){
        return CreatureProperties.find({
          'ancestors.id': creatureId,
          stats: this.model.variableName,
          type: 'proficiency',
          removed: {$ne: true},
          inactive: {$ne: true},
        });
      } else {
        return [];
      }
    },
    ability(){
      let creatureId = this.context.creatureId;
      let ability = this.model.ability;
      if (!creatureId || !ability) return;
      let abilityProp = CreatureProperties.findOne({
        'ancestors.id': creatureId,
        variableName: ability,
        type: 'attribute',
        removed: {$ne: true},
        inactive: {$ne: true},
        overridden: {$ne: true},
      });
      if (!abilityProp) return;
      return {
        _id: abilityProp._id,
        name: abilityProp.name,
        operation: 'base',
        result: abilityProp.modifier,
        stats: [this.model.variableName],
        ancestors: abilityProp.ancestors,
      }
    },
    proficiencyBonus(){
      let creatureId = this.context.creatureId;
      if (!creatureId) return;
      let creature = Creatures.findOne(creatureId)
      return creature &&
        creature.variables.proficiencyBonus &&
        creature.variables.proficiencyBonus.currentValue;
    },
  },
}
</script>

<style lang="css" scoped>
</style>
