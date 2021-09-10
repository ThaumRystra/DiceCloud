/**
 * Performs a depth first traversal of the character tree, summing the container
 * and inventory contents on the way up the tree
 */
export default function computeInventory(forest, dependencyGraph){
  const data = {
    weightTotal: 0,
    weightEquipment: 0,
    weightCarried: 0,
    valueTotal: 0,
    valueEquipment: 0,
    valueCarried: 0,
    itemsAttuned: 0,
  };
  // The stack of properties to still navigate
  const stack = [...forest];
  // The current containers we are inside of
  const containerStack = [];

  while(stack.length){
    const top = stack[stack.length - 1];
    const prop = top.node;
    if (prop._computationDetails.inventoryChildrenVisited){
      stack.pop();
      handleProp(prop, containerStack, data, dependencyGraph);
    } else {
      // Add all containers to the stack when we first visit them
      if (prop.type === 'container'){
        containerStack.push(top.node);
        setDefaultContainerData(prop);
      }
      // Push children onto the stack and mark this as children are visited
      stack.push(...top.children);
      prop._computationDetails.inventoryChildrenVisited = true;
    }
  }
  // Store all the computed values on the dependency graph variables
  for (let key in data){
    dependencyGraph.addNode(key, {engineValue: data[key]});
  }
}

function setDefaultContainerData(container){
  container.contentsWeight = 0;
  container.carriedWeight = 0;
  container.contentsValue = 0;
  container.carriedValue = 0;
}

function handleProp(prop, containerStack, data, dependencyGraph){
  // Determine if this property is carried, items are carried by default
  let carried = prop.type === 'container' ? prop.carried : true;

  // Weight and value for this property
  const weight = (prop.weight || 0) + (prop.contentsWeight || 0);
  const carriedWeight = (prop.weight || 0) + (prop.carriedWeight || 0);
  const value = (prop.value || 0) + (prop.value || 0);
  const carriedValue = (prop.value || 0) + (prop.carriedValue || 0);

  // Sum the item-specific data
  if (prop.type === 'item'){
    dependencyGraph.addLink('itemsAttuned', prop._id, 'inventory');
    if (prop.attuned) data.itemsAttuned += 1;
    if (prop.equipped){
      dependencyGraph.addLink('weightEquipment', prop._id, 'inventory');
      data.weightEquipment += weight;
      dependencyGraph.addLink('valueEquipment', prop._id, 'inventory');
      data.valueEquipment += value;
    }
  }

  // Get the parent container
  const container = containerStack[containerStack.length - 1];

  if (container){
    // The container depends on this prop for its contents data
    dependencyGraph.addLink(container._id, prop._id, 'inventory');
    // Add this property's weights and values to the container
    if (!container.weightless){
      container.contentsWeight += weight;
      if (carried) container.carriedWeight += carriedWeight;
    }
    container.contentsValue += value;
    if (carried) container.carriedValue += carriedValue;
  } else {
    // There is no parent container, add weights/value to the character data
    dependencyGraph.addLink('weightTotal', prop._id, 'inventory');
    data.weightTotal += weight;
    dependencyGraph.addLink('valueTotal', prop._id, 'inventory');
    data.valueTotal += value;
    if (carried){
      dependencyGraph.addLink('weightCarried', prop._id, 'inventory');
      data.weightCarried += carriedWeight;
      dependencyGraph.addLink('valueCarried', prop._id, 'inventory');
      data.valueCarried += carriedValue;
    }
  }
}
