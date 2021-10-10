import action from './applyPropertyByType/applyAction.js';
import adjustment from './applyPropertyByType/applyAdjustment.js';
import branch from './applyPropertyByType/applyBranch.js';
import buff from './applyPropertyByType/applyBuff.js';
import damage from './applyPropertyByType/applyDamage.js';
import roll from './applyPropertyByType/applyRoll.js';
import savingThrow from './applyPropertyByType/applySavingThrow.js';
import toggle from './applyPropertyByType/applyToggle.js';

const applyPropertyByType = {
  action,
  adjustment,
  branch,
  buff,
  damage,
  roll,
  savingThrow,
  spell: action,
  toggle,
};

export default function applyProperty(node, ...args){
  return applyPropertyByType[node.node.type]?.(node, ...args);
}
