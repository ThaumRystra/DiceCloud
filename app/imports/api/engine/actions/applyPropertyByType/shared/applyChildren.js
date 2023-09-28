import { applyNodeTriggers } from '/imports/api/engine/actions/applyTriggers';
import applyProperty from '/imports/api/engine/actions/applyProperty';

export default function applyChildren(node, actionContext) {
  applyNodeTriggers(node, 'after', actionContext);
  node.children.forEach(child => applyProperty(child, actionContext));
  applyNodeTriggers(node, 'afterChildren', actionContext);
}
