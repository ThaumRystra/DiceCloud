import walkDown from '/imports/api/engine/computation/utility/walkdown.js';

export default function computeInactiveStatus(node){
  const prop = node.node;
  if (isActive(prop)) return;
  // Unequipped items, notes, and actions disable their children,
  // but are not disabled themselves
  if (prop.type !== 'item' && prop.type !== 'note' && prop.type !== 'action' ){
    prop.inactive = true;
    prop.deactivatedBySelf = true;
  }
  // Mark children as inactive due to ancestor
  walkDown(node.children, child => {
    child.node.inactive = true;
    child.node.deactivatedByAncestor = true;
  });
}

function isActive(prop){
  if (prop.disabled) return false;
  switch (prop.type){
    case 'item': return !!prop.equipped;
    case 'spell': return !!prop.prepared || !!prop.alwaysPrepared;
    case 'note': return false;
    case 'action': return false;
    default: return true;
  }
}
