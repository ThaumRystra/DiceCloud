import getAggregatorResult from '/imports/api/creature/computation/newEngine/computeComputation/computeVariable/getAggregatorResult.js';

export default function computeVariableAsAttribute(node, prop, scope){
  let result = getAggregatorResult(node);
  prop.total = result;
  prop.value = prop.total - (prop.damage || 0);

  // Proficiency
  prop.proficiency = node.data.proficiency;

  // Ability scores get modifiers
  if (prop.attributeType === 'ability'){
    prop.modifier = Math.floor((prop.currentValue - 10) / 2);
  }

  // Hit dice denormalise constitution modifier
  if (prop.attributeType === 'hitDice') {
    prop.constitutionMod = scope['constitution']?.modifier || 0;
  }

  // Stats that have no effects or base value can be hidden
  prop.hide = !node.data.effectAggregator &&
    prop.baseValue === undefined ||
    undefined
}
