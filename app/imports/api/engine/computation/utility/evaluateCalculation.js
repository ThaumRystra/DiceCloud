import resolve, { toString } from '/imports/parser/resolve.js';

export default function evaluateCalculation(calculation, scope, givenContext) {
  const parseNode = calculation.parseNode;
  const fn = calculation._parseLevel;
  const calculationScope = { ...calculation._localScope, ...scope };
  const { result: resultNode, context } = resolve(fn, parseNode, calculationScope, givenContext);
  calculation.errors = context.errors;
  if (resultNode?.parseType === 'constant') {
    calculation.value = resultNode.value;
  } else if (resultNode?.parseType === 'error') {
    calculation.value = null;
  } else {
    calculation.value = toString(resultNode);
  }
  // remove the working fields
  delete calculation._parseLevel;
  delete calculation._localScope;
}
