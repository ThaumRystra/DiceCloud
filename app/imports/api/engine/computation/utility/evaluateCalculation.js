import resolve, { toString } from '/imports/parser/resolve.js';

export default function evaluateCalculation(calculation, scope, givenContext) {
  const parseNode = calculation.parseNode;
  const fn = calculation._parseLevel;
  const calculationScope = { ...calculation._localScope, ...scope };
  const { result: resultNode, context } = resolve(fn, parseNode, calculationScope, givenContext);
  calculation.errors = context.errors;
  calculation.value = resultNode;
  calculation.displayValue = toString(resultNode);
  // remove the working fields
  delete calculation._parseLevel;
  delete calculation._localScope;
}
