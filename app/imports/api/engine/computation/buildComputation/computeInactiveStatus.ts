import { CreatureProperty } from '/imports/api/creature/creatureProperties/CreatureProperties';
import walkDown from '/imports/api/engine/computation/utility/walkdown';
import { TreeNode } from '/imports/api/parenting/parentingFunctions';
import { isSpell } from '/imports/api/properties/Spells';

export default function computeInactiveStatus(node: TreeNode<CreatureProperty>): void {
  const prop = node.doc;
  if (!isActive(prop)) {
    // Mark prop inactive due to self
    prop.inactive = true;
    prop.deactivatedBySelf = true;
  }
  if (!childrenActive(prop)) {
    // Mark children as inactive due to ancestor
    walkDown(node.children, child => {
      child.doc.inactive = true;
      child.doc.deactivatedByAncestor = true;
    });
  }
}

function isActive(prop: CreatureProperty): boolean {
  if (prop.disabled) return false;
  if (isSpell(prop)) {
    return !!prop.prepared || !!prop.alwaysPrepared;
  }
  return true;
}

function childrenActive(prop: CreatureProperty): boolean {
  // Children of disabled properties are always inactive
  if (prop.disabled) return false;
  switch (prop.type) {
    // Only equipped items with non-zero quantity have active children
    case 'item': return !!prop.equipped && prop.quantity !== 0;
    // The children of actions, spells, and triggers are always inactive
    case 'action': return false;
    case 'spell': return false;
    case 'trigger': return false;
    // Other children are active
    default: return true;
  }
}
