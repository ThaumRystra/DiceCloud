import embedInlineCalculations from '../utility/embedInlineCalculations.js';
import evaluateCalculation from '../utility/evaluateCalculation.js';

export default function computeCalculations(computation, node){
  if (!node.data) return;
  // evaluate all the calculations
  node.data._computationDetails?.calculations?.forEach(calcObj => {
    evaluateCalculation(calcObj, computation.scope)
  });
  node.data._computationDetails?.inlineCalculations?.forEach(inlineCalcObj => {
    embedInlineCalculations(inlineCalcObj);
  });
}
