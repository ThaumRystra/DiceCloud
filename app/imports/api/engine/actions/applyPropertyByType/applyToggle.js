import recalculateCalculation from './shared/recalculateCalculation';
import { applyNodeTriggers } from '/imports/api/engine/actions/applyTriggers';
import applyChildren from '/imports/api/engine/actions/applyPropertyByType/shared/applyChildren';

export default function applyToggle(node, actionContext) {
  applyNodeTriggers(node, 'before', actionContext);
  const prop = node.doc
  recalculateCalculation(prop.condition, actionContext);
  if (prop.condition?.value) {
    return applyChildren(node, actionContext);
  }
}
