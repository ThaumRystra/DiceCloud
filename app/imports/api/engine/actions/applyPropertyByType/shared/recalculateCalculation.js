import logErrors from './logErrors.js';
import { toPrimitiveOrString } from '/imports/parser/resolve.js';
import {
  aggregateCalculationEffects,
  aggregateCalculationProficiencies,
  resolveCalculationNode,
} from '/imports/api/engine/computation/computeComputation/computeByType/computeCalculation.js';
import { getSingleProperty } from '/imports/api/engine/loadCreatures';
import resolve from '/imports/parser/resolve.js';

// Redo the work of imports/api/engine/computation/computeComputation/computeByType/computeCalculation.js
// But in the action scope
export default function recalculateCalculation(calcObj, actionContext, parseLevel = 'reduce', context) {
  if (!calcObj?.parseNode) return;
  calcObj._parseLevel = parseLevel;
  // Re-resolve the parse node
  resolveCalculationNode(calcObj, calcObj.parseNode, actionContext.scope, context);
  // store the unaffected value
  if (calcObj.effectIds || calcObj.proficiencyIds) {
    calcObj.unaffected = toPrimitiveOrString(calcObj.valueNode);
  }
  // Apply all the effects and proficiencies
  aggregateCalculationEffects(
    calcObj,
    id => getSingleProperty(actionContext.creature._id, id)
  );
  aggregateCalculationProficiencies(
    calcObj,
    id => getSingleProperty(actionContext.creature._id, id),
    actionContext.scope['proficiencyBonus']?.value || 0
  );
  // Resolve the modified valueNode
  resolveCalculationNode(calcObj, calcObj.valueNode, actionContext.scope, context);

  // Store the primitive value
  calcObj.value = toPrimitiveOrString(calcObj.valueNode);

  logErrors(calcObj.errors, actionContext);
}

export function rollAndReduceCalculation(calcObj, actionContext, context) {
  // Compile
  recalculateCalculation(calcObj, actionContext, 'compile', context);
  const compiled = calcObj.valueNode;
  const compileErrors = context.errors;

  // Roll
  context.errors = [];
  const { result: rolled } = resolve('roll', calcObj.valueNode, actionContext.scope, context);
  const rollErrors = context.errors;

  // Reduce
  context.errors = [];
  const { result: reduced } = resolve('reduce', rolled, actionContext.scope, context);
  const reduceErrors = context.errors;

  // Return
  return { compiled, compileErrors, rolled, rollErrors, reduced, reduceErrors };
}
