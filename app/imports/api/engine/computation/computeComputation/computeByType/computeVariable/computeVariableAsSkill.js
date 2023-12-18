import aggregate from './aggregate/index';

export default function computeVariableAsSkill(computation, node, prop) {
  // Skills are based on some ability Modifier
  let ability = computation.scope[prop.ability];
  prop.abilityMod = ability?.modifier || 0;

  // Inherit the ability's skill effects and proficiencies if skill is not a save
  if (prop.skillType !== 'save' && ability) {
    aggregateAbilityEffects({
      computation,
      skillNode: node,
      abilityNode: computation.dependencyGraph.getNode(prop.ability)
    });
  }

  // Proficiency
  prop.proficiency = node.data.proficiency;

  // Get the character's proficiency bonus to apply
  let profBonus = computation.scope['proficiencyBonus']?.value || 0;

  // Multiply the proficiency bonus by the actual proficiency
  if (prop.proficiency === 0.49) {
    // Round down proficiency bonus in the special case
    profBonus = Math.floor(profBonus * 0.5);
  } else {
    profBonus = Math.ceil(profBonus * prop.proficiency);
  }

  // Combine everything to get the final result
  const statBase = node.data.baseValue || 0;
  const aggregator = node.data.effectAggregator;
  const aggregatorBase = aggregator?.base || 0;

  // Store effects and proficiencies
  prop.effectIds = node.data.effectIds;
  prop.definitions = node.data.definitions;
  prop.proficiencyIds = node.data.proficiencyIds;

  // If there is no aggregator, determine if the prop can hide, then exit
  if (!aggregator) {
    prop.hide = statBase === undefined &&
      prop.proficiency == 0 ||
      undefined;
    prop.value = (statBase || 0) + prop.abilityMod + profBonus;
    return;
  }
  // Combine aggregator
  const base = statBase > aggregatorBase ? statBase : aggregatorBase;
  let result = (base + prop.abilityMod + profBonus + aggregator.add) * aggregator.mul;
  if (result < aggregator.min) result = aggregator.min;
  if (result > aggregator.max) result = aggregator.max;
  if (aggregator.set !== undefined) {
    result = aggregator.set;
  }
  if (Number.isFinite(result)) {
    result = Math.floor(result);
  }
  prop.value = result;
  // Advantage/disadvantage
  if (aggregator.advantage && !aggregator.disadvantage) {
    prop.advantage = 1;
  } else if (aggregator.disadvantage && !aggregator.advantage) {
    prop.advantage = -1;
  } else {
    prop.advantage = 0;
  }
  // Passive bonus
  prop.passiveBonus = aggregator.passiveAdd;
  // +/- 5 to passive bonus if the skill has advantage/disadvantage
  if (
    prop.advantage === 1
    && Number.isFinite(prop.passiveBonus)
  ) {
    prop.passiveBonus += 5;
  } else if (
    prop.advantage === -1
    && Number.isFinite(prop.passiveBonus)
  ) {
    prop.bassiveBonus -= 5;
  }
  // conditional benefits
  prop.conditionalBenefits = aggregator.conditional;
  // Roll bonuses
  prop.rollBonus = aggregator.rollBonus;
  // Forced to fail
  prop.fail = aggregator.fail;
  // Rollbonus
  prop.rollBonuses = aggregator.rollBonus;
}

function aggregateAbilityEffects({ computation, skillNode, abilityNode }) {
  if (!abilityNode?.id) return;
  computation.dependencyGraph.forEachLinkedNode(
    abilityNode.id,
    (linkedNode, link) => {
      if (!linkedNode.data) linkedNode.data = {};
      // Ignore inactive props
      if (linkedNode.data.inactive) return;
      // Check that the link is a valid effect/proficiency to pass on
      // to a skill from its ability
      if (link.data === 'effect') {
        if (![
          'advantage', 'disadvantage', 'passiveAdd', 'fail', 'conditional'
        ].includes(linkedNode.data.operation)) {
          return;
        }
      }
      // Apply the aggregations
      let arg = { node: skillNode, linkedNode, link };
      aggregate.effect(arg);
      aggregate.proficiency(arg);
    },
    true // enumerate only outbound links
  );
}
