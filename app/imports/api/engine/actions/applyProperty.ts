import action from './applyPropertyByType/applyAction';
import ammo from './applyPropertyByType/applyItemAsAmmo'
import adjustment from './applyPropertyByType/applyAdjustment';
import branch from './applyPropertyByType/applyBranch';
import buff from './applyPropertyByType/applyBuff';
import buffRemover from './applyPropertyByType/applyBuffRemover';
import damage from './applyPropertyByType/applyDamage';
import folder from './applyPropertyByType/applyFolder';
import note from './applyPropertyByType/applyNote';
import roll from './applyPropertyByType/applyRoll';
import savingThrow from './applyPropertyByType/applySavingThrow';
import toggle from './applyPropertyByType/applyToggle';
import ActionContext from '/imports/api/engine/actions/ActionContext';
import { TreeNode } from '/imports/api/parenting/parentingFunctions';
import { CreatureProperty } from '/imports/api/creature/creatureProperties/CreatureProperties';

const applyPropertyByType = {
  action,
  ammo,
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

export default function applyProperty(node: TreeNode<CreatureProperty>, actionContext: ActionContext, ...rest) {
  if (node.doc.deactivatedByToggle) return;
  actionContext.scope[`#${node.doc.type}`] = node.doc;
  applyPropertyByType[node.doc.type]?.(node, actionContext, ...rest);
}
