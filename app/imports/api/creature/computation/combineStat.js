import computeStat from '/imports/api/creature/computation/computeStat.js';
import applyToggles from '/imports/api/creature/computation/applyToggles.js';
import evaluateCalculation from '/imports/api/creature/computation/evaluateCalculation.js';

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
  let result = (aggregator.base + aggregator.add) * aggregator.mul;
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
  stat.baseValue = aggregator.statBaseValue;
  stat.baseValueErrors = aggregator.baseValueErrors;
  if (stat.attributeType === 'ability') {
    stat.modifier = Math.floor((stat.value - 10) / 2);
  }
  if (stat.attributeType === 'spellSlot'){
    let {value, errors} = evaluateCalculation(stat.spellSlotLevelCalculation, memo);
    stat.spellSlotLevelValue = value,
    stat.spellSlotLevelErrors = errors;
  }
  stat.currentValue = stat.value - (stat.damage || 0);
  stat.hide = aggregator.hasNoEffects &&
    stat.baseValue === undefined ||
    undefined
}

function combineSkill(stat, aggregator, memo){
  // Skills are based on some ability Modifier
  let ability = memo.statsByVariableName[stat.ability]
  if (stat.ability && ability){
    if (!ability.computationDetails.computed){
      computeStat(ability, memo);
    }
    stat.abilityMod = ability.modifier;
  }
  // Combine all the child proficiencies
  stat.proficiency = stat.baseProficiency || 0;
  for (let i in stat.computationDetails.proficiencies){
    let prof = stat.computationDetails.proficiencies[i];
    applyToggles(prof, memo);
    if (
      !prof.computationDetails.disabledByToggle &&
      prof.value > stat.proficiency
    ){
      stat.proficiency = prof.value;
    }
  }
  // Get the character's proficiency bonus to apply
  let profBonusStat = memo.statsByVariableName['proficiencyBonus'];
  let profBonus = profBonusStat && profBonusStat.value;

  if (typeof profBonus !== 'number' && memo.statsByVariableName['level']){
    let level = memo.statsByVariableName['level'].value;
    profBonus = Math.ceil(level / 4) + 1;
  }
  // Multiply the proficiency bonus by the actual proficiency
  profBonus *= stat.proficiency;
  // Base value
  stat.baseValue = aggregator.statBaseValue;
  stat.baseValueErrors = aggregator.baseValueErrors;
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
