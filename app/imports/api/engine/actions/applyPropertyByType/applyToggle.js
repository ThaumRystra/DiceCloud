import recalculateCalculation from './shared/recalculateCalculation.js';
import { applyNodeTriggers } from '/imports/api/engine/actions/applyTriggers.js';
import applyChildren from '/imports/api/engine/actions/applyPropertyByType/shared/applyChildren.js';

export default function applyToggle(node, actionContext) {
  applyNodeTriggers(node, 'before', actionContext);
  const prop = node.node;
  recalculateCalculation(prop.condition, actionContext);
  if (prop.condition?.value) {
    return applyChildren(node, actionContext);
  }
}
