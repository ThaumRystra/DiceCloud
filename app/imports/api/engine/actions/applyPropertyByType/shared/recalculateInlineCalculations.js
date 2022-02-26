import embedInlineCalculations from '/imports/api/engine/computation/utility/embedInlineCalculations.js';
import recalculateCalculation from './recalculateCalculation.js'

export default function recalculateInlineCalculations(inlineCalcObj, scope, log){
  // Skip if there are no calculations
  if (!inlineCalcObj?.inlineCalculations?.length) return;
  // Recalculate each calculation with the current scope
  inlineCalcObj.inlineCalculations.forEach(calc => {
    recalculateCalculation(calc, scope, log);
  });
  // Embed the new calculated values
  embedInlineCalculations(inlineCalcObj);
}
