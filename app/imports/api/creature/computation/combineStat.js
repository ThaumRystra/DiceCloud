import computeStat from '/imports/api/creature/computation/computeStat.js';
import computedValueOfVariableName from '/imports/api/creature/computation/computedValueOfVariableName.js'


export default function combineStat(stat, aggregator, memo){
  if (stat.type === 'attribute'){
    combineAttribute(stat, aggregator);
  } else if (stat.type === 'skill'){
    combineSkill(stat, aggregator, memo);
  } else if (stat.type === 'damageMultiplier'){
    combineDamageMultiplier(stat, memo);
  }
}

function combineAttribute(stat, aggregator){
  let result = (aggregator.base + aggregator.add) * aggregator.mul;
  if (result < aggregator.min) result = aggregator.min;
  if (result > aggregator.max) result = aggregator.max;
  if (!stat.decimal) result = Math.floor(result);
  stat.value = result;
  if (stat.attributeType === 'ability') {
    stat.modifier = Math.floor((result - 10) / 2);
  }
  stat.currentValue = stat.value - (stat.damage || 0);
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
    if (prof.value > stat.proficiency) stat.proficiency = prof.value;
  }
  // Get the character's proficiency bonus to apply
  let profBonus = computedValueOfVariableName('proficiencyBonus', memo);
  /** TODO level needs to be on the memo somewhere
  if (typeof profBonus !== "number"){
    profBonus = Math.floor(char.level / 4 + 1.75);
  }
  */
  // Multiply the proficiency bonus by the actual proficiency
  profBonus *= stat.proficiency;
  // Combine everything to get the final result
  let result = (stat.abilityMod + profBonus + aggregator.add) * aggregator.mul;
  if (result < aggregator.min) result = aggregator.min;
  if (result > aggregator.max) result = aggregator.max;
  result = Math.floor(result);
  if (stat.base > result) result = stat.base;
  stat.value = result;
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
