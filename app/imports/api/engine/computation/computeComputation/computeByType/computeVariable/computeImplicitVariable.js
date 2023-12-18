import getAggregatorResult from './getAggregatorResult';

/*
 * Variables with effects, proficiencies, or damage multipliers but no defining
 * properties are added to the scope as implicit variables
 */
export default function computeImplicitVariable(node) {
  const prop = {};

  // Combine damage multipliers
  if (node.data.immunity) {
    prop.immunity = node.data.immunity;
    prop.immunities = node.data.immunities;
  }
  if (node.data.resistance) {
    prop.resistance = node.data.resistance;
    prop.resistances = node.data.resistances;
  }
  if (node.data.vulnerability) {
    prop.vulnerability = node.data.vulnerability;
    prop.vulnerabilities = node.data.vulnerabilities;
  }

  const result = getAggregatorResult(node);
  if (result !== undefined) {
    prop.value = result;
  }
  if (node.data.proficiency !== undefined) {
    prop.proficiency = node.data.proficiency;
  }

  // denormalise class level aggregator
  let classLevelAgg = node.data.classLevelAggregator;
  if (classLevelAgg) {
    prop.level = classLevelAgg.level;
  }

  // denormalise the effect aggregator fields
  const aggregator = node.data.effectAggregator;
  if (aggregator) {
    if (aggregator.advantage && !aggregator.disadvantage) {
      prop.advantage = 1;
    } else if (aggregator.disadvantage && !aggregator.advantage) {
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

  return prop;
}
