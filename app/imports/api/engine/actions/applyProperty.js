import action from './applyPropertyByType/applyAction.js';
import adjustment from './applyPropertyByType/applyAdjustment.js';
import branch from './applyPropertyByType/applyBranch.js';
import buff from './applyPropertyByType/applyBuff.js';
import buffRemover from './applyPropertyByType/applyBuffRemover.js';
import damage from './applyPropertyByType/applyDamage.js';
import folder from './applyPropertyByType/applyFolder.js';
import note from './applyPropertyByType/applyNote.js';
import roll from './applyPropertyByType/applyRoll.js';
import savingThrow from './applyPropertyByType/applySavingThrow.js';
import toggle from './applyPropertyByType/applyToggle.js';

const applyPropertyByType = {
  action,
  adjustment,
  branch,
  buff,
  buffRemover,
  damage,
  folder,
  note,
  propertySlot: folder,
  roll,
  savingThrow,
  spell: action,
  toggle,
};

export default function applyProperty(node, actionContext, ...rest) {
  if (node.node.deactivatedByToggle) return;
  actionContext.scope[`#${node.node.type}`] = node.node;
  applyPropertyByType[node.node.type]?.(node, actionContext, ...rest);
}
