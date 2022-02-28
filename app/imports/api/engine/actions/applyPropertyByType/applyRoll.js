import applyProperty from '../applyProperty.js';
import recalculateCalculation from './shared/recalculateCalculation.js';

export default function applyRoll(node, {creature, targets, scope, log}){
  const prop = node.node;

  if (prop.roll?.calculation){
    recalculateCalculation(prop.roll, scope, log);

    if (isFinite(prop.roll.value)){
      scope[prop.variableName] = prop.roll.value;
    }
    log.content.push({
      name: prop.name,
      value: prop.variableName + ' = ' + prop.roll.calculation + ' = ' + prop.roll.value,
      inline: true,
    });
  }
  return node.children.forEach(child => applyProperty(child, {
    creature, targets, scope, log
  }));
}
