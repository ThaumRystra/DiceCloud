import applyChildren from '/imports/api/engine/actions/applyPropertyByType/shared/applyChildren.js';
import recalculateCalculation from './shared/recalculateCalculation.js';
import { damagePropertyWork } from '/imports/api/creature/creatureProperties/methods/damageProperty.js';
import { applyNodeTriggers } from '/imports/api/engine/actions/applyTriggers.js';

export default function applyAdjustment(node, actionContext) {
  applyNodeTriggers(node, 'before', actionContext);
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
        if (!prop.silent) actionContext.addLog({
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
      if (!prop.silent) actionContext.addLog({
        name: 'Attribute damage',
        value: `${prop.stat}${prop.operation === 'set' ? ' set to' : ''}` +
          ` ${value}`,
        inline: true,
      });
    });
  } else {
    if (!prop.silent) actionContext.addLog({
      name: 'Attribute damage',
      value: `${prop.stat}${prop.operation === 'set' ? ' set to' : ''}` +
        ` ${value}`,
      inline: true,
    });
  }

  return applyChildren(node, actionContext);
}
