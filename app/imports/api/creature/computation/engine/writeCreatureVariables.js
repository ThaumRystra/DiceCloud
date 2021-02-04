import { pick, forOwn } from 'lodash';
import Creatures from '/imports/api/creature/Creatures.js';
import VERSION from '/imports/constants/VERSION.js';

export default function writeCreatureVariables(memo, creatureId, fullRecompute = true) {
  const fields = [
    'name',
    'attributeType',
    'baseValue',
    'spellSlotLevelValue',
    'damage',
    'decimal',
    'reset',
    'resetMultiplier',
    'value',
    'currentValue',
    'modifier',
    'ability',
    'skillType',
    'baseProficiency',
    'abilityMod',
    'advantage',
    'passiveBonus',
    'proficiency',
    'conditionalBenefits',
    'rollBonuses',
    'fail',
    'level',
  ];

  if (fullRecompute){
    memo.creatureVariables = {};
    forOwn(memo.statsByVariableName, (stat, variableName) => {
      let condensedStat = pick(stat, fields);
      memo.creatureVariables[variableName] = condensedStat;
    });
    Creatures.update(creatureId, {$set: {
      variables: memo.creatureVariables,
      computeVersion: VERSION,
    }});
  } else {
    let $set = {};
    forOwn(memo.statsByVariableName, (stat, variableName) => {
      let condensedStat = pick(stat, fields);
      $set[`variables.${variableName}`] = condensedStat;
    });
    Creatures.update(creatureId, {$set});
  }
}
