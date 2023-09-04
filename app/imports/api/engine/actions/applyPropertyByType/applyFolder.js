import applyChildren from '/imports/api/engine/actions/applyPropertyByType/shared/applyChildren.js';
import { applyNodeTriggers } from '/imports/api/engine/actions/applyTriggers.js';

export default function applyFolder(node, actionContext) {
  // Apply triggers
  applyNodeTriggers(node, 'before', actionContext);
  // Apply children
  applyChildren(node, actionContext);
}
