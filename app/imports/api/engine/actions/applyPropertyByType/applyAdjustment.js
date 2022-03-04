import applyProperty from '../applyProperty.js';
import recalculateCalculation from './shared/recalculateCalculation.js';
import { damagePropertyWork } from '/imports/api/creature/creatureProperties/methods/damageProperty.js';

export default function applyAdjustment(node, {
  creature, targets, scope, log
}){
  const prop = node.node;
  const damageTargets = prop.target === 'self' ? [creature] : targets;

  if (!prop.amount) {
    return applyChildren(node, {creature, targets, scope, log});
  }

  // Evaluate the amount
  recalculateCalculation(prop.amount, scope, log);

  const value = +prop.amount.value;
  if (!isFinite(value)) {
    return applyChildren(node, {creature, targets, scope, log});
  }

  if (damageTargets?.length) {
    damageTargets.forEach(target => {
      let stat = target.variables[prop.stat];
      if (!stat?.type) {
        log.content.push({
          name: 'Error',
          value: `Could not apply attribute damage, creature does not have \`${prop.stat}\` set`
        });
        return applyChildren(node, {creature, targets, scope, log});
      }
      damagePropertyWork({
        property: stat,
        operation: prop.operation,
        value: value,
      });
      log.content.push({
        name: 'Attribute damage',
        value: `${prop.stat}${prop.operation === 'set' ? ' set to' : ''}` +
        ` ${value}`,
        inline: true,
      });
    });
  } else {
    log.content.push({
      name: 'Attribute damage',
      value: `${prop.stat}${prop.operation === 'set' ? ' set to' : ''}` +
      ` ${value}`,
      inline: true,
    });
  }

  return applyChildren(node, {creature, targets, scope, log});
}

function applyChildren(node, args){
  node.children.forEach(child => applyProperty(child, args));
}
