import recalculateInlineCalculations from './shared/recalculateInlineCalculations.js';
import applyProperty from '../applyProperty.js';
import { applyNodeTriggers } from '/imports/api/engine/actions/applyTriggers.js';

export default function applyFolder(node, actionContext) {
  // Apply triggers
  applyNodeTriggers(node, 'before', actionContext);
  applyNodeTriggers(node, 'after', actionContext);
  // Apply children
  node.children.forEach(child => applyProperty(child, actionContext));
}
