import walkDown from '/imports/api/engine/computation/utility/walkdown.js';

export default function computeInactiveStatus(node){
  const prop = node.node;
  if (!isActive(prop)){
    // Mark prop inactive due to self
    prop.inactive = true;
    prop.deactivatedBySelf = true;
  }
  if(!childrenActive(prop)){
    // Mark children as inactive due to ancestor
    walkDown(node.children, child => {
      child.node.inactive = true;
      child.node.deactivatedByAncestor = true;
    });
  }
}

function isActive(prop){
  if (prop.disabled) return false;
  switch (prop.type){
    // Unprepared spells are inactive
    case 'spell': return !!prop.prepared || !!prop.alwaysPrepared;
    default: return true;
  }
}

function childrenActive(prop){
  // Children of disabled properties are always inactive
  if (prop.disabled) return false;
  switch (prop.type){
    // Only equipped items with non-zero quantity have active children
    case 'item': return !!prop.equipped && prop.quantity !== 0;
    // The children of actions, spells, and triggers are always inactive
    case 'action': return false;
    case 'spell': return false;
    case 'trigger': return false;
    // The children of notes are always inactive
    case 'note': return false;
    // Other children are active
    default: return true;
  }
}
