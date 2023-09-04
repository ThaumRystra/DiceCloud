export default function aggregateInventory({ node, linkedNode, link }) {
  let linkedProp = linkedNode.data || {};
  const prop = node.data;

  switch (link.data) {
    case 'attunedItem':
      prop.baseValue = (prop.baseValue || 0) + 1;
      return;

    case 'equippedItem':
      if (node.id === 'weightEquipment') {
        prop.baseValue = (prop.baseValue || 0) + weight(linkedProp);
      } else if (node.id === 'valueEquipment') {
        prop.baseValue = (prop.baseValue || 0) + value(linkedProp);
      }
      return;

    case 'containerContents':
      // Add this property's weights and values to the container
      if (!prop.weightless) {
        prop.contentsWeight = (prop.contentsWeight || 0) + weight(linkedProp);
        if (prop.carried && !prop.contentsWeightless) {
          prop.carriedWeight = (prop.carriedWeight || 0) + carriedWeight(linkedProp);
        }
      }
      prop.contentsValue = (prop.contentsValue || 0) + value(linkedProp);
      if (prop.carried) {
        prop.carriedValue = (prop.carriedValue || 0) + carriedValue(linkedProp);
      }
      return;

    case 'inventoryStats':
      if (node.id === 'weightTotal') {
        prop.baseValue = (prop.baseValue || 0) + weight(linkedProp);
      } else if (node.id === 'valueTotal') {
        prop.baseValue = (prop.baseValue || 0) + value(linkedProp);
      } else if (node.id === 'weightCarried') {
        prop.baseValue = (prop.baseValue || 0) + carriedWeight(linkedProp);
      } else if (node.id === 'valueCarried') {
        prop.baseValue = (prop.baseValue || 0) + carriedValue(linkedProp);
      }
      return;
  }
}

function quantity(prop) {
  if (typeof prop.quantity === 'number') {
    return prop.quantity;
  } else {
    return 1;
  }
}

function weight(prop) {
  return (prop.weight || 0) * quantity(prop) + (prop.contentsWeight || 0);
}

function carriedWeight(prop) {
  return (prop.weight || 0) * quantity(prop) + (prop.carriedWeight || 0);
}

function value(prop) {
  return (prop.value || 0) * quantity(prop) + (prop.contentsValue || 0);
}

function carriedValue(prop) {
  return (prop.value || 0) * quantity(prop) + (prop.carriedValue || 0);
}
