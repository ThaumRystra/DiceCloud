/**
 * Performs a depth first traversal of the character tree, summing the container
 * and inventory contents on the way up the tree
 */
export default function linkInventory(forest, dependencyGraph) {
  // The stack of properties to still navigate
  const stack = [...forest.trees];
  // The current containers we are inside of
  const containerStack = [];

  while (stack.length) {
    const top = stack[stack.length - 1];
    const prop = top.doc;
    if (prop._computationDetails.inventoryChildrenVisited) {
      if (prop.type === 'container') containerStack.pop();
      stack.pop();
      handleProp(prop, containerStack, dependencyGraph);
    } else {
      // Add all containers to the stack when we first visit them
      if (prop.type === 'container') {
        containerStack.push(top.doc);
      }
      // Push children onto the stack and mark this as children are visited
      stack.push(...top.children);
      prop._computationDetails.inventoryChildrenVisited = true;
    }
  }
}

function handleProp(prop, containerStack, dependencyGraph) {
  // Skip props that aren't part of the inventory
  if (prop.type !== 'item' && prop.type !== 'container') return;
  // Determine if this property is carried, items are carried by default
  let carried = prop.type === 'container' ? prop.carried : true;

  // Item-specific links
  if (prop.type === 'item') {
    if (prop.attuned) {
      dependencyGraph.addLink('itemsAttuned', prop._id, 'attunedItem');
    }
    if (prop.equipped) {
      dependencyGraph.addLink('weightEquipment', prop._id, 'equippedItem');
      dependencyGraph.addLink('valueEquipment', prop._id, 'equippedItem');
    }
  }

  // Get the parent container
  const container = containerStack[containerStack.length - 1];

  if (container) {
    // The container depends on this prop for its contents data
    dependencyGraph.addLink(container._id, prop._id, 'containerContents');
  } else {
    // There is no parent container, the character totals depend on this prop
    dependencyGraph.addLink('weightTotal', prop._id, 'inventoryStats');
    dependencyGraph.addLink('valueTotal', prop._id, 'inventoryStats');
    if (carried) {
      dependencyGraph.addLink('weightCarried', prop._id, 'inventoryStats');
      dependencyGraph.addLink('valueCarried', prop._id, 'inventoryStats');
    }
  }
}
