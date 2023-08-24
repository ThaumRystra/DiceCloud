import applyProperty from '../applyProperty.js';
import recalculateCalculation from './shared/recalculateCalculation.js';
import rollDice from '/imports/parser/rollDice.js';
import applyChildren from '/imports/api/engine/actions/applyPropertyByType/shared/applyChildren.js';
import { applyNodeTriggers } from '/imports/api/engine/actions/applyTriggers.js';

export default function applyBranch(node, actionContext) {
  applyNodeTriggers(node, 'before', actionContext);
  const scope = actionContext.scope;
  const targets = actionContext.targets;
  const prop = node.node;
  switch (prop.branchType) {
    case 'if':
      recalculateCalculation(prop.condition, actionContext);
      if (prop.condition?.value) applyChildren(node, actionContext);
      break;
    case 'index':
      if (node.children.length) {
        recalculateCalculation(prop.condition, actionContext);
        if (!isFinite(prop.condition?.value)) {
          actionContext.addLog({
            name: 'Branch Error',
            value: 'Index did not resolve into a valid number'
          });
          break;
        }
        let index = Math.floor(prop.condition?.value);
        if (index < 1) index = 1;
        if (index > node.children.length) index = node.children.length;
        applyNodeTriggers(node, 'after', actionContext);
        applyProperty(node.children[index - 1], actionContext);
        applyNodeTriggers(node, 'afterChildren', actionContext);
      }
      break;
    case 'hit':
      if (scope['~attackHit']?.value) {
        if (!targets.length && !prop.silent) actionContext.addLog({ value: '**On hit**' });
        applyChildren(node, actionContext);
      }
      break;
    case 'miss':
      if (scope['~attackMiss']?.value) {
        if (!targets.length && !prop.silent) actionContext.addLog({ value: '**On miss**' });
        applyChildren(node, actionContext);
      }
      break;
    case 'failedSave':
      if (scope['~saveFailed']?.value) {
        if (!targets.length && !prop.silent) actionContext.addLog({ value: '**On failed save**' });
        applyChildren(node, actionContext);
      }
      break;
    case 'successfulSave':
      if (scope['~saveSucceeded']?.value) {
        if (!targets.length && !prop.silent) actionContext.addLog({ value: '**On save**', });
        applyChildren(node, actionContext);
      }
      break;
    case 'random':
      if (node.children.length) {
        let index = rollDice(1, node.children.length)[0] - 1;
        applyNodeTriggers(node, 'after', actionContext);
        applyProperty(node.children[index], actionContext);
        applyNodeTriggers(node, 'afterChildren', actionContext);
      }
      break;
    case 'eachTarget':
      if (targets.length) {
        targets.forEach(target => {
          applyNodeTriggers(node, 'after', actionContext);
          actionContext.targets = [target]
          node.children.forEach(child => applyProperty(child, actionContext));
          applyNodeTriggers(node, 'afterChildren', actionContext);
        });
      } else {
        applyChildren(node, actionContext);
      }
      break;
  }
}
