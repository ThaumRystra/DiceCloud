import embedInlineCalculations from '/imports/api/engine/computation/utility/embedInlineCalculations';
import recalculateCalculation from './recalculateCalculation'

export default function recalculateInlineCalculations(inlineCalcObj, actionContext) {
  // Skip if there are no calculations
  if (!inlineCalcObj?.inlineCalculations?.length) return;
  // Recalculate each calculation with the current scope
  inlineCalcObj.inlineCalculations.forEach(calc => {
    recalculateCalculation(calc, actionContext);
  });
  // Embed the new calculated values
  embedInlineCalculations(inlineCalcObj);
}
