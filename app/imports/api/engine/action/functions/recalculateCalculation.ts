import { Context, toPrimitiveOrString } from '/imports/parser/resolve';
import {
  aggregateCalculationEffects,
  aggregateCalculationProficiencies,
  resolveCalculationNode,
} from '/imports/api/engine/computation/computeComputation/computeByType/computeCalculation';
import { getSingleProperty } from '/imports/api/engine/loadCreatures';
import resolve from '/imports/parser/resolve';
import { getEffectiveActionScope } from '/imports/api/engine/action/functions/getEffectiveActionScope';

// TODO Redo the work of
// imports/api/engine/computation/computeComputation/computeByType/computeCalculation.js
// But in the action scope
export default async function recalculateCalculation(
  calcObj, action, parseLevel = 'reduce', context, scope
) {
  if (!calcObj?.parseNode) return;
  calcObj._parseLevel = parseLevel;
  if (!scope) {
    scope = await getEffectiveActionScope(action);
  }
  // Re-resolve the parse node
  resolveCalculationNode(calcObj, calcObj.parseNode, scope, context);
  // store the unaffected value
  if (calcObj.effectIds || calcObj.proficiencyIds) {
    calcObj.unaffected = toPrimitiveOrString(calcObj.valueNode);
  }
  // Apply all the effects and proficiencies
  aggregateCalculationEffects(
    calcObj,
    id => getSingleProperty(action.creatureId, id)
  );
  aggregateCalculationProficiencies(
    calcObj,
    id => getSingleProperty(action.creatureId, id),
    scope['proficiencyBonus']?.value || 0
  );
  // Resolve the modified valueNode
  resolveCalculationNode(calcObj, calcObj.valueNode, scope, context);

  // Store the primitive value
  calcObj.value = toPrimitiveOrString(calcObj.valueNode);
  // TODO log errors
}

export async function rollAndReduceCalculation(calcObj, action) {
  const context = new Context();
  const scope = await getEffectiveActionScope(action);
  // Compile
  recalculateCalculation(calcObj, action, 'compile', context, scope);
  const compiled = calcObj.valueNode;

  // Roll
  const { result: rolled } = resolve('roll', calcObj.valueNode, scope, context);

  // Reduce
  const { result: reduced } = resolve('reduce', rolled, scope, context);

  // Return
  return { compiled, rolled, reduced, errors: context.errors };
}
