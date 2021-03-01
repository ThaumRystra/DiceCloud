import { pick, forOwn } from 'lodash';
import Creatures from '/imports/api/creature/Creatures.js';
import VERSION from '/imports/constants/VERSION.js';

export default function writeCreatureVariables(memo, creatureId, fullRecompute = true) {
  const fields = [
    'ability',
    'abilityMod',
    'advantage',
    'attributeType',
    'baseProficiency',
    'baseValue',
    'calculation',
    'conditionalBenefits',
    'currentValue',
    'damage',
    'decimal',
    'fail',
    'level',
    'modifier',
    'name',
    'passiveBonus',
    'proficiency',
    'reset',
    'resetMultiplier',
    'rollBonuses',
    'skillType',
    'spellSlotLevelValue',
    'type',
    'value',
  ];

  if (fullRecompute){
    memo.creatureVariables = {};
    forOwn(memo.statsByVariableName, (stat, variableName) => {
      // Don't save context variables
      if (variableName[0] === '#') return;
      let condensedStat = pick(stat, fields);
      memo.creatureVariables[variableName] = condensedStat;
    });
    forOwn(memo.constantsByVariableName, (stat, variableName) => {
      let condensedStat = pick(stat, fields);
      if (!memo.creatureVariables[variableName]){
        memo.creatureVariables[variableName] = condensedStat;
      }
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
