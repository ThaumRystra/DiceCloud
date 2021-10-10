import evaluateCalculation from '/imports/api/engine/computation/utility/evaluateCalculation.js';
import logErrors from './logErrors.js';

export default function recalculateCalculation(calc, scope, log, context){
  if (!calc.parseNode) return;
  calc._parseLevel = 'reduce';
  evaluateCalculation(calc, scope, context);
  logErrors(calc.errors, log);
}
