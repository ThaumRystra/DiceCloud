import evaluateCalculation from '/imports/api/engine/computation/utility/evaluateCalculation.js';
import applyEffectsToCalculationParseNode from '/imports/api/engine/actions/applyPropertyByType/shared/applyEffectsToCalculationParseNode.js';
import logErrors from './logErrors.js';

export default function recalculateCalculation(calc, scope, log, context){
  if (!calc?.parseNode) return;
  calc._parseLevel = 'reduce';
  applyEffectsToCalculationParseNode(calc, log);
  evaluateCalculation(calc, scope, context);
  logErrors(calc.errors, log);
}
