import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import nodesToTree from '/imports/api/parenting/parenting.js';

export default function recomputeInventory(creatureId){
  let inventoryForest = nodesToTree({
    collection: CreatureProperties,
    ancestorId: creatureId,
    filter: {
      type: {$in: ['container', 'item']},
    },
    deactivatedByAncestor: {$ne: true},
  });
  return getChildrenInventoryData(inventoryForest);
}

function getChildrenInventoryData(forest){
  let data = {
    weightTotal: 0,
    weightEquipment: 0,
    weightCarried: 0,
    valueTotal: 0,
    valueEquipment: 0,
    valueCarried: 0,
  }
  forest.forEach(tree => {
    let treeData = getInventoryData(tree);
    for (let key in data){
      data[key] += treeData[key];
    }
  });
}

function getInventoryData(tree){
  let data = {
    weightTotal: 0,
    weightEquipment: 0,
    weightCarried: 0,
    valueTotal: 0,
    valueEquipment: 0,
    valueCarried: 0,
    itemsAttuned: 0,
  }
  let childData = getChildrenInventoryData(tree.children);
  let node = tree.node;
  if (node.type === 'container'){
    data.weightTotal += node.weight;
    data.valueTotal += node.value;
    if (node.carried){
      data.weightCarried += node.weight;
      data.valueCarried += node.valueCarried;
    }
    storeContentsData(node, childData);
  } else if (node.type === 'item'){
    data.weightTotal += node.weight * node.quantity;
    data.valueTotal += node.value * node.quantity;
    data.weightCarried += node.weight * node.quantity;
    data.valueCarried += node.valueCarried * node.quantity;
    if (node.equipped){
      data.weightEquipment += node.weight * node.quantity;
      data.valueEquipment += node.valueCarried * node.quantity;
    }
    if (node.attuned){
      data.itemsAttuned += 1;
    }
  }
  for (let key in data){
    data[key] += childData[key];
  }
  return data
}

function storeContentsData(node, childData){
  let newContentsWeight;
  if (node.contentsWeightless){
    newContentsWeight = 0;
  } else {
    newContentsWeight = childData.weightCarried
  }
  if (node.contentsWeight !== newContentsWeight){
    node.contentsWeight = newContentsWeight;
    node.contentsWeightChanged = true;
  }
  let newContentsValue = childData.valueCarried;
  if (node.contentsValue !== newContentsValue){
    node.contentsValue = newContentsValue;
    node.contentsValueChanged = true;
  }
}
