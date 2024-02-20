import getAggregatorResult from './getAggregatorResult';

export default function computeVariableAsAttribute(computation, node, prop) {
  let result = getAggregatorResult(node) || 0;

  prop.total = result;

  // Apply damage in a way that respects the damage rules, modifying damage if need be
  // Bound the damage
  if (!prop.ignoreLowerLimit && prop.damage > prop.total) {
    prop.damage = prop.total;
  }
  if (!prop.ignoreUpperLimit && prop.damage < 0) {
    prop.damage = 0;
  }
  // Apply damage
  prop.value = prop.total - (prop.damage || 0);

  // Proficiency
  prop.proficiency = node.data.proficiency;

  // Advantage/disadvantage
  const aggregator = node.data.effectAggregator;
  if (aggregator) {
    if (aggregator.advantage && !aggregator.disadvantage) {
      prop.advantage = 1;
    } else if (aggregator.disadvantage && !aggregator.advantage) {
      prop.advantage = -1;
    } else {
      prop.advantage = 0;
    }
  }

  // Ability scores get modifiers
  if (prop.attributeType === 'ability') {
    prop.modifier = Math.floor((prop.value - 10) / 2);
  }

  // Hit dice denormalise constitution modifier
  if (prop.attributeType === 'hitDice') {
    prop.constitutionMod = computation.scope['constitution']?.modifier || 0;
  }

  // Stats that have no effects or base value can be hidden
  prop.hide = !node.data.effectAggregator &&
    prop.baseValue === undefined ||
    undefined

  // Store effects and proficiencies
  prop.effectIds = node.data.effectIds;
  prop.definitions = node.data.definitions;
  prop.proficiencyIds = node.data.proficiencyIds;
}
