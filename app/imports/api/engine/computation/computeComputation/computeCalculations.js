import { CompilationContext } from '/imports/parser/parser.js';
import INLINE_CALCULATION_REGEX from '/imports/constants/INLINE_CALCULTION_REGEX.js';
import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';

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

function evaluateCalculation(calculation, scope){
  const context = new CompilationContext();
  const parseNode = calculation._parsedCalculation;
  const fn = calculation._parseLevel;
  const calculationScope = {...calculation._localScope, ...scope};
  const resultNode = parseNode[fn](calculationScope, context);
  if (resultNode instanceof ConstantNode){
    calculation.value = resultNode.value;
  } else {
    calculation.value = NaN;
  }
  if (calculation.errors){
    calculation.errors = [...calculation.errors, ...context.errors]
  } else {
    calculation.errors = context.errors
  }
}

function embedInlineCalculations(inlineCalcObj){
  const string = inlineCalcObj.text;
  const calculations = inlineCalcObj.inlineCalculations;
  if (!string || !calculations) return;
  let index = 0;
  inlineCalcObj.value = string.replace(INLINE_CALCULATION_REGEX, substring => {
    let calc = calculations[index++];
    return (calc && 'value' in calc) ? calc.value : substring;
  });
}
