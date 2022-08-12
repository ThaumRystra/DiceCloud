import applyProperty from '../applyProperty.js';
import recalculateCalculation from './shared/recalculateCalculation.js';

export default function applyToggle(node, actionContext){
  const prop = node.node;
  recalculateCalculation(prop.condition, actionContext);
  if (prop.condition?.value) {
    return node.children.forEach(child => applyProperty(child, actionContext));
  }
}
