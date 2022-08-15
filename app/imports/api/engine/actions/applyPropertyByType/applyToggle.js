import applyProperty from '../applyProperty.js';
import recalculateCalculation from './shared/recalculateCalculation.js';
import { applyNodeTriggers } from '/imports/api/engine/actions/applyTriggers.js';

export default function applyToggle(node, actionContext){
  applyNodeTriggers(node, 'before', actionContext);
  const prop = node.node;
  recalculateCalculation(prop.condition, actionContext);
  if (prop.condition?.value) {
    applyNodeTriggers(node, 'after', actionContext);
    return node.children.forEach(child => applyProperty(child, actionContext));
  }
}
