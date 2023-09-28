import applyChildren from '/imports/api/engine/actions/applyPropertyByType/shared/applyChildren';
import { applyNodeTriggers } from '/imports/api/engine/actions/applyTriggers';

export default function applyFolder(node, actionContext) {
  // Apply triggers
  applyNodeTriggers(node, 'before', actionContext);
  // Apply children
  applyChildren(node, actionContext);
}
