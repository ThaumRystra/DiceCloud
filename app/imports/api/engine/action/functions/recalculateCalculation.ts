import Context from '../../../../parser/types/Context';
import toPrimitiveOrString from '/imports/parser/toPrimitiveOrString';
import {
  aggregateCalculationEffects,
  aggregateCalculationProficiencies,
} from '/imports/api/engine/computation/computeComputation/computeByType/computeCalculation';
import { getSingleProperty } from '/imports/api/engine/loadCreatures';
import resolve from '/imports/parser/resolve';
import { getEffectiveActionScope } from '/imports/api/engine/action/functions/getEffectiveActionScope';
import { CalculatedField } from '/imports/api/properties/subSchemas/computedField';
import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';
import { EngineAction } from '/imports/api/engine/action/EngineActions';
import ResolveLevel from '/imports/parser/types/ResolveLevel';
import constant from '/imports/parser/parseTree/constant';

export default async function recalculateCalculation(
  calcObj: CalculatedField,
  action: EngineAction,
  parseLevel: ResolveLevel = 'reduce',
  userInput: InputProvider,
) {
  if (!calcObj?.parseNode) return;
  const scope = await getEffectiveActionScope(action);
  // Re-resolve the parse node before effects and proficiencies
  const {
    result: unaffectedResult,
    context
  } = await resolve(parseLevel, calcObj.parseNode, scope, undefined, userInput);
  calcObj.valueNode = unaffectedResult;

  // store the unaffected value
  if (calcObj.effectIds || calcObj.proficiencyIds) {
    calcObj.unaffected = toPrimitiveOrString(calcObj.valueNode);
  }
  // Apply all the effects and proficiencies
  aggregateCalculationEffects(
    calcObj,
    (id: string) => getSingleProperty(action.creatureId, id)
  );
  aggregateCalculationProficiencies(
    calcObj,
    (id: string) => getSingleProperty(action.creatureId, id),
    scope['proficiencyBonus']?.value || 0
  );

  // Resolve the modified valueNode, use the same context
  const {
    result: finalResult
  } = await resolve(parseLevel, calcObj.valueNode, scope, context, userInput);

  // Store the errors
  calcObj.errors = context.errors;

  // Store the value and its primitive
  calcObj.value = toPrimitiveOrString(finalResult);
  calcObj.valueNode = finalResult;
}

export async function rollAndReduceCalculation(
  calcObj: CalculatedField, action: EngineAction, userInput: InputProvider
) {
  if (!calcObj) throw new Error('calcObj is required');
  const context = new Context();
  const scope = await getEffectiveActionScope(action);

  // Compile
  await recalculateCalculation(calcObj, action, 'compile', userInput);
  const compiled = calcObj.valueNode ?? constant.create({ value: 0 });

  // Roll
  const { result: rolled } = await resolve('roll', compiled, scope, context, userInput);

  // Reduce
  const { result: reduced } = await resolve('reduce', rolled, scope, context, userInput);

  // Return
  return { compiled, rolled, reduced, errors: context.errors };
}
