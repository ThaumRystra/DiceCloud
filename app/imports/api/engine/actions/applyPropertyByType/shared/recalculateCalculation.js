import evaluateCalculation from '../utility/evaluateCalculation.js';
import logErrors from './logErrors.js';

export default function recalculateCalculation(calc, scope, log){
  if (!calc.parseNode) return;
  calc._parseLevel = 'reduce';
  evaluateCalculation(calc, scope);
  logErrors(calc.errors, log);
}
