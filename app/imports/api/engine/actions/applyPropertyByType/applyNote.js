import recalculateInlineCalculations from './shared/recalculateInlineCalculations.js';
import applyProperty from '../applyProperty.js';

export default function applyNote(node, {creature, targets, scope, log}){
  const prop = node.node;

  // Log Name, summary
  let content = { name: prop.name };
  if (prop.summary?.text){
    recalculateInlineCalculations(prop.summary, scope, log);
    content.value = prop.summary.value;
  }
  if (content.name || content.value){
    log.content.push(content);
  }
  // Log description
  if (prop.description?.text){
    recalculateInlineCalculations(prop.description, scope, log);
    log.content.push({value: prop.description.value});
  }
  // Apply children
  node.children.forEach(child => applyProperty(child, {
    creature, targets, scope, log
  }));
}
