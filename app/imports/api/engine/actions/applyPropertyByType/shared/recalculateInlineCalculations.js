import embedInlineCalculations from '/imports/api/engine/computation/utility/embedInlineCalculations';
import recalculateCalculation from './recalculateCalculation'

export default async function recalculateInlineCalculations(inlineCalcObj, action) {
  // Skip if there are no calculations
  if (!inlineCalcObj?.inlineCalculations?.length) return;
  // Recalculate each calculation with the current scope
  const promises = [];
  for (const calc of inlineCalcObj.inlineCalculations) {
    promises.push(recalculateCalculation(calc, action));
  }
  await Promise.all(promises);
  // Embed the new calculated values
  embedInlineCalculations(inlineCalcObj);
}
