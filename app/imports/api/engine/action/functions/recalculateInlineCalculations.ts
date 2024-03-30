import embedInlineCalculations from '/imports/api/engine/computation/utility/embedInlineCalculations';
import recalculateCalculation from './recalculateCalculation'
import { InlineCalculation } from '/imports/api/properties/subSchemas/inlineCalculationField';
import { EngineAction } from '/imports/api/engine/action/EngineActions';
import ResolveLevel from '/imports/parser/types/ResolveLevel';
import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';

export default async function recalculateInlineCalculations(
  inlineCalcObj: InlineCalculation, action: EngineAction,
  parseLevel: ResolveLevel, userInput: InputProvider
) {
  // Skip if there are no calculations
  if (!inlineCalcObj?.inlineCalculations?.length) return;
  // Recalculate each calculation with the current scope
  for (const calc of inlineCalcObj.inlineCalculations) {
    await recalculateCalculation(calc, action, undefined, userInput);
  }
  // Embed the new calculated values
  embedInlineCalculations(inlineCalcObj);
}
