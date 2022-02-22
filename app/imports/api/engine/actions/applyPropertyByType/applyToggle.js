import applyProperty from '../applyProperty.js';
import recalculateCalculation from './shared/recalculateCalculation.js';

export default function applyToggle(node, {
  creature, targets, scope, log
}){
  const prop = node.node;
  recalculateCalculation(prop.condition, scope, log);
  if (prop.condition?.value) {
    return node.children.forEach(child => applyProperty(child, {
      creature, targets, scope, log
    }));
  }
}
