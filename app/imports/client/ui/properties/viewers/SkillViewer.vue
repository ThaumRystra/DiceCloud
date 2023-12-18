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
            :attribute="model"
            :data-id="ability._id"
            @click="clickEffect(ability._id)"
          />
          <attribute-effect
            v-for="effect in effects"
            :key="effect._id"
            :model="effect"
            :attribute="model"
            :data-id="effect._id"
            @click="clickEffect(effect._id)"
          />
        </v-list>
      </property-field>
    </v-row>
    <v-row
      v-if="proficiencies.length"
      dense
    >
      <property-field
        :cols="{col: 12}"
        name="Proficiencies"
      >
        <v-list style="width: 100%">
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
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin';
import numberToSignedString from '../../../../api/utility/numberToSignedString';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import AttributeEffect from '/imports/client/ui/properties/components/attributes/AttributeEffect.vue';
import SkillProficiency from '/imports/client/ui/properties/components/skills/SkillProficiency.vue';
import getProficiencyIcon from '/imports/client/ui/utility/getProficiencyIcon';
import sortEffects from '/imports/client/ui/utility/sortEffects';
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
      if (!this.model.effectIds) return [];
      const effects = CreatureProperties.find({ _id: { $in: this.model.effectIds } }).fetch();
      return sortEffects(effects);
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
    proficiencies() {
      if (!this.model.proficiencyIds) return [];
      return CreatureProperties.find({
          _id: {$in: this.model.proficiencyIds},
      }, {
        sort: {order: 1}
      }).fetch();
    },
    ability() {
      let creatureId = this.context.creatureId;
      let ability = this.model.ability;
      if (!creatureId || !ability) return;
      let abilityProp = CreatureProperties.findOne({
        variableName: ability,
        type: 'attribute',
        removed: { $ne: true },
        inactive: { $ne: true },
        overridden: { $ne: true },
        'ancestors.id': creatureId,
      });
      if (!abilityProp) return;
      return {
        _id: abilityProp._id,
        name: abilityProp.name,
        operation: 'base',
        amount: { value: abilityProp.modifier },
        stats: [this.model.variableName],
        ancestors: abilityProp.ancestors,
      }
    },
    proficiencyBonus() {
      return CreatureProperties.findOne({
        variableName: 'proficiencyBonus',
        overridden: { $ne: true },
        removed: { $ne: true },
        inactive: { $ne: true },
        'ancestors.id': this.context.creatureId,
      })?.value;
    },
  },
}
</script>

<style lang="css" scoped>

</style>
