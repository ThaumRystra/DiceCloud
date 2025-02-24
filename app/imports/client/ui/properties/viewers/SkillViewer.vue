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
        :name="$t('SkillViewer.itiQzZR9_lCU6Hzv4oZIi')"
        :value="isFinite(model.value) ?
          numberToSignedString(model.value) :
          model.value"
      />
      <property-field
        v-if="model.proficiency !== undefined"
        :name="$t('InlineProficiency.jN183F3ufg8Le9jkznJ4p')"
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
        :name="$t('AttributeViewer.MNk7FUYtABwXmOJJeujzZ')"
        mono
        :value="model.variableName"
      />
      <property-field
        :name="$t('CheckInput.ZOqgwwG1rCTTKIVrY23XB')"
        mono
        :value="model.ability"
      />
      <property-field
        :name="$t('SkillViewer.YZboQ2SYx9re2HQvMJ7cl')"
        :value="skillTypes[model.skillType]"
      />
      <property-field
        v-if="'passiveBonus' in model"
        :name="$t('SkillViewer.SF0Q1ye2fl6S1zGeeWzTT')"
        :value="passiveScore"
      />
      <property-field
        v-if="model.overridden"
        :cols="{cols: 6, md: 12}"
        :name="$t('AttributeViewer.tPFT2_kLfhaS8Od_i6cAK')"
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
        :name="$t('AttributeViewer.kgj4Ky-O4dlLEDYQyGP2V')"
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
        :name="$t('PrintedStats.INiHkB9G-fGTkJrdfgXjS')"
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
import { getFilter } from '/imports/api/parenting/parentingFunctions';

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
        0: this.$t('AttributeViewer.zS5I5I1HtvQ-bmZWAvNWK'),
        1: this.$t('SkillProficiency.c7_OrgWVaMZiroKapKs0O'),
        0.49: this.$t('SkillProficiency.rdG6DgAZ2pH5uGiEXs9ni'),
        0.5: this.$t('SkillProficiency.H3H4WWeJkDnYc9n0b8pee'),
        2: this.$t('SkillProficiency.Lq-INVfia0gaEurWHuCvq'),
      },
      skillTypes: {
        skill: this.$t('CheckInput.sKXmebGzd92GfO5RYbSPI'),
        save: this.$t('ImageInputDialog.dcbgmuOVYglN2J7VpTBFU'),
        check: this.$t('SelectedCreatureBar.UcAwEN_Jmv7Lezh-o8g6S'),
        tool: this.$t('SkillForm.xayNU3cxaIOtLz1iCrUX_'),
        weapon: this.$t('SkillForm._uUQIQfQJm94jRvJnoCa4'),
        armor: this.$t('StatsTab.HuxcSGUjObZNOlWVKkZG4'),
        language: this.$t('SkillForm.PfUrjVRAHmEX7AhfxnPTT'),
        utility: this.$t('AttributeForm.QUnXaen7rDzDb624npbUE'),
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
        sort: {left: 1}
      }).fetch();
    },
    ability() {
      let creatureId = this.context.creatureId;
      let ability = this.model.ability;
      if (!creatureId || !ability) return;
      let abilityProp = CreatureProperties.findOne({
        ...getFilter.descendantsOfRoot(creatureId),
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
        operation: 'base',
        amount: { value: abilityProp.modifier },
        stats: [this.model.variableName],
        root: abilityProp.root,
      }
    },
    proficiencyBonus() {
      return CreatureProperties.findOne({
        ...getFilter.descendantsOfRoot(this.context.creatureId),
        variableName: 'proficiencyBonus',
        overridden: { $ne: true },
        removed: { $ne: true },
        inactive: { $ne: true },
      })?.value;
    },
  },
}
</script>

<style lang="css" scoped>

</style>
