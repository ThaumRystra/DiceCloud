import computeStat from '/imports/api/creature/computation/engine/computeStat.js';
import computeProficiency from '/imports/api/creature/computation/engine/computeProficiency.js';
import evaluateCalculation from '/imports/api/creature/computation/engine/evaluateCalculation.js';
import { union } from 'lodash';

export default function combineStat(stat, aggregator, memo){
  if (stat.type === 'attribute'){
    combineAttribute(stat, aggregator, memo);
  } else if (stat.type === 'skill'){
    combineSkill(stat, aggregator, memo);
  } else if (stat.type === 'damageMultiplier'){
    combineDamageMultiplier(stat, memo);
  }
}

function getAggregatorResult(stat, aggregator){
  let base = Math.max(aggregator.base, stat.baseValue || 0);
  let result = (base + aggregator.add) * aggregator.mul;
  if (result < aggregator.min) {
    result = aggregator.min;
  }
  if (result > aggregator.max) {
    result = aggregator.max;
  }
  if (aggregator.set !== undefined) {
    result = aggregator.set;
  }
  if (!stat.decimal && Number.isFinite(result)){
    result = Math.floor(result);
  }
  return result;
}

function combineAttribute(stat, aggregator, memo){
  stat.value = getAggregatorResult(stat, aggregator);
  if (stat.attributeType === 'spellSlot'){
    let {
      result,
      context,
      dependencies
    } = evaluateCalculation({
      string: stat.spellSlotLevelCalculation,
      memo,
      prop: stat,
    });
    stat.spellSlotLevelValue = result.value;
    stat.spellSlotLevelErrors = context.errors;
    stat.dependencies = union(stat.dependencies, dependencies);
  }
  stat.currentValue = stat.value - (stat.damage || 0);
  // Ability scores get modifiers
  if (stat.attributeType === 'ability') {
    stat.modifier = Math.floor((stat.currentValue - 10) / 2);
  } else {
    stat.modifier = undefined;
  }
  // Hit dice get constitution modifiers
  stat.constitutionMod = undefined;
  if (stat.attributeType === 'hitDice') {
    let conStat = memo.statsByVariableName['constitution'];
    if (conStat && 'modifier' in conStat){
      stat.constitutionMod = conStat.modifier;
      stat.dependencies = union(
        stat.dependencies,
        [conStat._id],
        conStat.dependencies,
      );
    }
  }
  // Stats that have no effects can be hidden based on a sheet setting
  stat.hide = aggregator.hasNoEffects &&
    stat.baseValue === undefined ||
    undefined
}

function combineSkill(stat, aggregator, memo){
  // Skills are based on some ability Modifier
  let ability = stat.ability && memo.statsByVariableName[stat.ability]
  if (stat.ability && ability){
    computeStat(ability, memo);
    stat.abilityMod = ability.modifier;
    stat.dependencies = union(
      stat.dependencies,
      [ability._id],
      ability.dependencies,
    );
  } else {
    stat.abilityMod = 0;
  }
  // Combine all the child proficiencies
  stat.proficiency = 0;
  for (let i in stat.computationDetails.proficiencies){
    let prof = stat.computationDetails.proficiencies[i];
    computeProficiency(prof, memo);
    if (
      !prof.deactivatedByToggle &&
      prof.value > stat.proficiency
    ){
      stat.proficiency = prof.value;
      stat.dependencies = union(
        stat.dependencies,
        [prof._id],
        prof.dependencies,
      );
    }
  }
  // Get the character's proficiency bonus to apply
  let profBonusStat = memo.statsByVariableName['proficiencyBonus'];
  let profBonus = profBonusStat && profBonusStat.value;

  if (typeof profBonus !== 'number' && memo.statsByVariableName['level']){
    let levelProp = memo.statsByVariableName['level'];
    let level = levelProp.value;
    profBonus = Math.ceil(level / 4) + 1;
    if (levelProp._id){
      stat.dependencies = union(stat.dependencies, [levelProp._id]);
    }
    if (levelProp.dependencies){
      stat.dependencies = union(stat.dependencies, levelProp.dependencies);
    }
  } else {
    stat.dependencies = union(
      stat.dependencies,
      [profBonusStat._id],
      profBonusStat.dependencies,
    );
  }
  // Multiply the proficiency bonus by the actual proficiency
  profBonus *= stat.proficiency;
  // Combine everything to get the final result
  let result = (aggregator.base + stat.abilityMod + profBonus + aggregator.add) * aggregator.mul;
  if (result < aggregator.min) result = aggregator.min;
  if (result > aggregator.max) result = aggregator.max;
  if (aggregator.set !== undefined) {
    result = aggregator.set;
  }
  if (Number.isFinite(result)){
    result = Math.floor(result);
  }
  stat.value = result;
  // Advantage/disadvantage
  if (aggregator.advantage && !aggregator.disadvantage){
    stat.advantage = 1;
  } else if (aggregator.disadvantage && !aggregator.advantage){
    stat.advantage = -1;
  } else {
    stat.advantage = 0;
  }
  // Passive bonus
  stat.passiveBonus = aggregator.passiveAdd;
  // conditional benefits
  stat.conditionalBenefits = aggregator.conditional;
  // Roll bonuses
  stat.rollBonus = aggregator.rollBonus;
  // Forced to fail
  stat.fail = aggregator.fail;
  // Rollbonus
  stat.rollBonuses = aggregator.rollBonus;
  // Hide
  stat.hide = aggregator.hasNoEffects &&
    stat.baseValue === undefined &&
    stat.proficiency == 0 ||
    undefined;
}

function combineDamageMultiplier(stat){
  if (stat.immunityCount) return 0;
  let result;
  if (stat.ressistanceCount && !stat.vulnerabilityCount){
    result = 0.5;
  }  else if (!stat.ressistanceCount && stat.vulnerabilityCount){
    result = 2;
  } else {
    result = 1;
  }
  stat.value = result;
}
