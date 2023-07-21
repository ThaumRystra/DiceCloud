import evaluateCalculation from '/imports/api/engine/computation/utility/evaluateCalculation.js';
import applyEffectsToCalculationParseNode from '/imports/api/engine/actions/applyPropertyByType/shared/applyEffectsToCalculationParseNode.js';
import logErrors from './logErrors.js';

export default function recalculateCalculation(calc, actionContext, context) {
  if (!calc?.parseNode) return;
  calc._parseLevel = 'reduce';
  applyEffectsToCalculationParseNode(calc, actionContext);
  evaluateCalculation(calc, actionContext.scope, context);
  logErrors(calc.errors, actionContext);
}
