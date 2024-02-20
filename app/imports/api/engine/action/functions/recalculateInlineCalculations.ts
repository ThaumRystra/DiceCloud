import embedInlineCalculations from '/imports/api/engine/computation/utility/embedInlineCalculations';
import recalculateCalculation from './recalculateCalculation'

export default async function recalculateInlineCalculations(inlineCalcObj, action, parseLevel, userInput) {
  // Skip if there are no calculations
  if (!inlineCalcObj?.inlineCalculations?.length) return;
  // Recalculate each calculation with the current scope
  for (const calc of inlineCalcObj.inlineCalculations) {
    await recalculateCalculation(calc, action, undefined, userInput);
  }
  // Embed the new calculated values
  embedInlineCalculations(inlineCalcObj);
}
