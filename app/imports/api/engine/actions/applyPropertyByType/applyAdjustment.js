import applyProperty from '../applyProperty.js';
import recalculateCalculation from './shared/recalculateCalculation.js';
import { damagePropertyWork } from '/imports/api/creature/creatureProperties/methods/damageProperty.js';

export default function applyAdjustment(node, actionContext){
  const prop = node.node;
  const damageTargets = prop.target === 'self' ? [actionContext.creature] : actionContext.targets;

  if (!prop.amount) {
    return applyChildren(node, actionContext);
  }

  // Evaluate the amount
  recalculateCalculation(prop.amount, actionContext);

  const value = +prop.amount.value;
  if (!isFinite(value)) {
    return applyChildren(node, actionContext);
  }

  if (damageTargets?.length) {
    damageTargets.forEach(target => {
      let stat = target.variables[prop.stat];
      if (!stat?.type) {
        actionContext.addLog({
          name: 'Error',
          value: `Could not apply attribute damage, creature does not have \`${prop.stat}\` set`
        });
        return applyChildren(node, actionContext);
      }
      damagePropertyWork({
        prop: stat,
        operation: prop.operation,
        value,
        actionContext,
      });
      actionContext.addLog({
        name: 'Attribute damage',
        value: `${prop.stat}${prop.operation === 'set' ? ' set to' : ''}` +
        ` ${value}`,
        inline: true,
      });
    });
  } else {
    actionContext.addLog({
      name: 'Attribute damage',
      value: `${prop.stat}${prop.operation === 'set' ? ' set to' : ''}` +
      ` ${value}`,
      inline: true,
    });
  }

  return applyChildren(node, actionContext);
}

function applyChildren(node, actionContext){
  node.children.forEach(child => applyProperty(child, actionContext));
}
