import walkDown from '/imports/api/creature/computation/newEngine/utility/walkdown.js';

export default function computeInactiveStatus(node){
  const prop = node.node;
  if (isActive(prop)) return;
  prop.inactive = true;
  prop.deactivatedBySelf = true;
  // Mark children as inactive due to ancestor
  walkDown(node.children, child => {
    child.node.inactive = true;
    child.node.deactivatedByAncestor = true;
  });
}

function isActive(prop){
  if (prop.disabled) return false;
  switch (prop.type){
    case 'buff': return !!prop.applied;
    case 'item': return !!prop.equipped;
    case 'spell': return !!prop.prepared || !!prop.alwaysPrepared;
    case 'note': return false;
    default: return true;
  }
}
