import action from './applyPropertyByType/applyAction.js';
import adjustment from './applyPropertyByType/applyAdjustment.js';
import branch from './applyPropertyByType/applyBranch.js';
import buff from './applyPropertyByType/applyBuff.js';
import damage from './applyPropertyByType/applyDamage.js';
import note from './applyPropertyByType/applyNote.js';
import roll from './applyPropertyByType/applyRoll.js';
import savingThrow from './applyPropertyByType/applySavingThrow.js';
import toggle from './applyPropertyByType/applyToggle.js';
import { applyNodeTriggers } from '/imports/api/engine/actions/applyTriggers.js';

const applyPropertyByType = {
  action,
  adjustment,
  branch,
  buff,
  damage,
  note,
  roll,
  savingThrow,
  spell: action,
  toggle,
};

export default function applyProperty(node, actionContext, ...rest) {
  applyNodeTriggers(node, actionContext, 'before');
  actionContext.scope[`#${node.node.type}`] = node.node;
  applyPropertyByType[node.node.type]?.(node, actionContext, ...rest);
  applyNodeTriggers(node, actionContext, 'after');
}
