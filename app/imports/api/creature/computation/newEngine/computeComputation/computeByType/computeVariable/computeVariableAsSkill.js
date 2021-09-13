export default function computeVariableAsSkill(node, prop, scope){
  // Skills are based on some ability Modifier
  let ability = scope[prop.ability];
  prop.abilityMod = ability?.modifier || 0;
  // TODO: Use this ability's skill effects/profs iff this skill is not a save

  // Proficiency
  prop.proficiency = node.data.proficiency;

  // Get the character's proficiency bonus to apply
  let profBonus = scope['proficiencyBonus']?.value || 0;

  // Multiply the proficiency bonus by the actual proficiency
  if(prop.proficiency === 0.49){
    // Round down proficiency bonus in the special case
    profBonus = Math.floor(profBonus * 0.5);
  } else {
    profBonus = Math.ceil(profBonus * prop.proficiency);
  }

  // Combine everything to get the final result
  const statBase = node.data.baseValue;
  const aggregator = node.data.effectAggregator;

  // If there is no aggregator, determine if the prop can hide, then exit
  if (!aggregator){
    prop.hide = statBase === undefined &&
      prop.proficiency == 0 ||
      undefined;
    prop.value = statBase;
    return;
  }
  // Combine aggregator
  const base = (statBase > aggregator.base ? statBase : aggregator.base) || 0;
  let result = (base + prop.abilityMod + profBonus + aggregator.add) * aggregator.mul;
  if (result < aggregator.min) result = aggregator.min;
  if (result > aggregator.max) result = aggregator.max;
  if (aggregator.set !== undefined) {
    result = aggregator.set;
  }
  if (Number.isFinite(result)){
    result = Math.floor(result);
  }
  prop.value = result;
  // Advantage/disadvantage
  if (aggregator.advantage && !aggregator.disadvantage){
    prop.advantage = 1;
  } else if (aggregator.disadvantage && !aggregator.advantage){
    prop.advantage = -1;
  } else {
    prop.advantage = 0;
  }
  // Passive bonus
  prop.passiveBonus = aggregator.passiveAdd;
  // conditional benefits
  prop.conditionalBenefits = aggregator.conditional;
  // Roll bonuses
  prop.rollBonus = aggregator.rollBonus;
  // Forced to fail
  prop.fail = aggregator.fail;
  // Rollbonus
  prop.rollBonuses = aggregator.rollBonus;
}
