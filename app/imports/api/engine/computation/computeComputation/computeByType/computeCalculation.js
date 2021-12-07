import evaluateCalculation from '../../utility/evaluateCalculation.js';

export default function computeCalculation(computation, node){
  const calcObj = node.data;
  evaluateCalculation(calcObj, computation.scope);
}
