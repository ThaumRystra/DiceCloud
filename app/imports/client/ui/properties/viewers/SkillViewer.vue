<script setup lang="ts">
import { computed, inject } from 'vue';
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import numberToSignedString from '../../../../api/utility/numberToSignedString';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import AttributeEffect from '/imports/client/ui/properties/components/attributes/AttributeEffect.vue';
import SkillProficiency from '/imports/client/ui/properties/components/skills/SkillProficiency.vue';
import getProficiencyIcon from '/imports/client/ui/utility/getProficiencyIcon';
import sortEffects from '/imports/client/ui/utility/sortEffects';
import { getFilter } from '/imports/api/parenting/parentingFunctions';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{ model: Record<string, any> }>();
const context = inject<any>('context', {});
const store = useStore(key);

const isFinite = Number.isFinite;

const proficiencyText: Record<number, string> = {
  0: 'Not proficient',
  1: 'Proficient',
  0.49: 'Half proficiency bonus rounded down',
  0.5: 'Half proficiency bonus rounded up',
  2: 'Double proficiency bonus',
};

const skillTypes: Record<string, string> = {
  skill: 'Skill',
  save: 'Save',
  check: 'Check',
  tool: 'Tool',
  weapon: 'Weapon',
  armor: 'Armor',
  language: 'Language',
  utility: 'Utility',
};

const icon = computed(() => getProficiencyIcon(props.model.proficiency));

const passiveScore = computed(() =>
  10 + props.model.value + props.model.passiveBonus
);

const { result: effects } = autorun(() => {
  if (!props.model.effectIds) return [];
  const effectList = CreatureProperties.find({ _id: { $in: props.model.effectIds } }).fetch();
  return sortEffects(effectList);
});

const { result: proficiencies } = autorun(() => {
  if (!props.model.proficiencyIds) return [];
  return CreatureProperties.find(
    { _id: { $in: props.model.proficiencyIds } },
    { sort: { left: 1 } }
  ).fetch();
});

const { result: ability } = autorun(() => {
  const creatureId = context.creatureId;
  const abilityName = props.model.ability;
  if (!creatureId || !abilityName) return undefined;
  const abilityProp = CreatureProperties.findOne({
    ...getFilter.descendantsOfRoot(creatureId),
    variableName: abilityName,
    type: 'attribute',
    removed: { $ne: true },
    inactive: { $ne: true },
    overridden: { $ne: true },
  });
  if (!abilityProp) return undefined;
  return {
    _id: abilityProp._id,
    name: abilityProp.name,
    operation: 'base',
    amount: { value: abilityProp.modifier },
    stats: [props.model.variableName],
    root: abilityProp.root,
  };
});

const { result: proficiencyBonus } = autorun(() =>
  CreatureProperties.findOne({
    ...getFilter.descendantsOfRoot(context.creatureId),
    variableName: 'proficiencyBonus',
    overridden: { $ne: true },
    removed: { $ne: true },
    inactive: { $ne: true },
  })?.value
);

function clickEffect(id: string) {
  store.commit('pushDialogStack', {
    component: 'creature-property-dialog',
    elementId: `${id}`,
    data: { _id: id },
  });
}
</script>

<template lang="html">
  <div class="skill-viewer">
    <v-row
      class="density"
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
        :cols="{ cols: 6, md: 12 }"
        name="Overridden"
        value="Overriden by another property with the same variable name"
      />
      <property-target-tags :model="model" />
    </v-row>
    <v-row dense>
      <property-description
        name="description"
        :model="model.description"
      />
    </v-row>
    <v-row
      v-if="ability || (effects && effects.length)"
      class="density"
    >
      <property-field
        :cols="{ col: 12 }"
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
      class="density"
    >
      <property-field
        :cols="{ col: 12 }"
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

<style lang="css" scoped></style>
