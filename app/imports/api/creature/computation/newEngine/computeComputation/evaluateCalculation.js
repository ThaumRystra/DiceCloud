import { CompilationContext } from '/imports/parser/parser.js';

export default function evaluateCalculation(calculation, scope){
  const context = new CompilationContext();
  const parseNode = calculation._parsedCalculation;
  const fn = calculation._parseLevel || 'reduce';
  const calculationScope = {...calculation._localScope, ...scope};
  const result = parseNode[fn](calculationScope, context);
  calculation.value = result;
  calculation.errors = context.errors;
}
