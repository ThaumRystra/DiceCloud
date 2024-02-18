import { Context, toPrimitiveOrString } from '/imports/parser/resolve';
import {
  aggregateCalculationEffects,
  aggregateCalculationProficiencies,
} from '/imports/api/engine/computation/computeComputation/computeByType/computeCalculation';
import { getSingleProperty } from '/imports/api/engine/loadCreatures';
import resolve from '/imports/parser/resolve';
import { getEffectiveActionScope } from '/imports/api/engine/action/functions/getEffectiveActionScope';
import { CalculatedField } from '/imports/api/properties/subSchemas/computedField';
import { ResolveLevel } from '/imports/parser/parseTree/NodeFactory';
import InputProvider from '/imports/api/engine/action/functions/InputProvider';
import { EngineAction } from '/imports/api/engine/action/EngineActions';

// TODO Redo the work of
// imports/api/engine/computation/computeComputation/computeByType/computeCalculation.js
// But in the action scope
export default async function recalculateCalculation(
  calcObj: CalculatedField,
  action,
  parseLevel: ResolveLevel = 'reduce',
  userInput: InputProvider,
) {
  if (!calcObj?.parseNode) return;
  const scope = await getEffectiveActionScope(action);
  // Re-resolve the parse node before effects and proficiencies
  const {
    result: unaffectedResult,
    context
  } = resolve(parseLevel, calcObj.parseNode, scope);
  calcObj.valueNode = unaffectedResult;

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

  // Resolve the modified valueNode, use the same context
  const {
    result: finalResult
  } = resolve(parseLevel, calcObj.parseNode, scope, context);

  // Store the errors
  calcObj.errors = context.errors;

  // Store the value and its primitive
  calcObj.value = toPrimitiveOrString(finalResult);
  calcObj.valueNode = finalResult;

}

export async function rollAndReduceCalculation(
  calcObj: CalculatedField, action: EngineAction, userInput: InputProvider
) {
  const context = new Context();
  const scope = await getEffectiveActionScope(action);
  // Compile
  recalculateCalculation(calcObj, action, 'compile', userInput);
  const compiled = calcObj.valueNode;

  // Roll
  const { result: rolled } = resolve('roll', calcObj.valueNode, scope, context);

  // Reduce
  const { result: reduced } = resolve('reduce', rolled, scope, context);

  // Return
  return { compiled, rolled, reduced, errors: context.errors };
}
