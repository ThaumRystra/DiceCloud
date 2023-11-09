import resolve, { toPrimitiveOrString } from '/imports/parser/resolve.js';
console.warn('evaluateCalculation is deprecated use resolveCalculationNode instead')
// TODO everywhere this is used, replace with more specific code to recalculate fields
export default function evaluateCalculation(calculation, scope, givenContext) {
  const parseNode = calculation.parseNode;
  const fn = calculation._parseLevel;
  const calculationScope = { ...calculation._localScope, ...scope };
  const { result: resultNode, context } = resolve(fn, parseNode, calculationScope, givenContext);
  calculation.errors = context.errors;
  calculation.valueNode = resultNode;
  calculation.value = toPrimitiveOrString(resultNode);
  // remove the working fields
  delete calculation._parseLevel;
  delete calculation._localScope;
}
