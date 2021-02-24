import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import Creatures from '/imports/api/creature/Creatures.js';
import { nodesToTree } from '/imports/api/parenting/parenting.js';

export default function recomputeInventory(creatureId){
  let inventoryForest = nodesToTree({
    collection: CreatureProperties,
    ancestorId: creatureId,
    filter: {
      type: {$in: ['container', 'item']},
    },
    deactivatedByAncestor: {$ne: true},
  });
  let containersToWrite = [];
  let data =  getChildrenInventoryData(inventoryForest, containersToWrite);
  containersToWrite.forEach(container => {
    CreatureProperties.update(container._id, {$set: {
      contentsWeight: container.contentsWeight,
      contentsValue: container.contentsValue,
    }}, {selector: {type: 'container'}});
  });
  Creatures.update(creatureId, {$set: {
    'denormalizedStats.weightTotal': data.weightTotal,
    'denormalizedStats.weightEquipment': data.weightEquipment,
    'denormalizedStats.weightCarried': data.weightCarried,
    'denormalizedStats.valueTotal': data.valueTotal,
    'denormalizedStats.valueEquipment': data.valueEquipment,
    'denormalizedStats.valueCarried': data.valueCarried,
    'denormalizedStats.itemsAttuned': data.itemsAttuned,
  }});
  return data;
}

function getChildrenInventoryData(forest, containersToWrite){
  let data = {
    weightTotal: 0,
    weightEquipment: 0,
    weightCarried: 0,
    valueTotal: 0,
    valueEquipment: 0,
    valueCarried: 0,
    itemsAttuned: 0,
  }
  forest.forEach(tree => {
    let treeData = getInventoryData(tree, containersToWrite);
    for (let key in data){
      data[key] += treeData[key] || 0;
    }
  });
  return data;
}

function getInventoryData(tree, containersToWrite){
  let data = {
    weightTotal: 0,
    weightEquipment: 0,
    weightCarried: 0,
    valueTotal: 0,
    valueEquipment: 0,
    valueCarried: 0,
    itemsAttuned: 0,
  }
  let childData = getChildrenInventoryData(tree.children, containersToWrite);
  let node = tree.node;
  if (node.type === 'container'){
    data.weightTotal += node.weight || 0;
    data.valueTotal += node.value || 0;
    data.weightCarried += node.weight || 0;
    data.valueCarried += node.value || 0;
    storeContentsData(node, childData, containersToWrite);
  } else if (node.type === 'item'){
    data.weightTotal += (node.weight * node.quantity) || 0;
    data.valueTotal += (node.value * node.quantity) || 0;
    data.weightCarried += (node.weight * node.quantity) || 0;
    data.valueCarried += (node.value * node.quantity) || 0;
    if (node.equipped){
      data.weightEquipment += (node.weight * node.quantity) || 0;
      data.valueEquipment += (node.value * node.quantity) || 0;
    }
    if (node.attuned){
      data.itemsAttuned += 1;
    }
  }
  for (let key in data){
    data[key] += childData[key];
  }
  if (node.carried === false){
    data.weightCarried = 0;
    data.valueCarried = 0;
  }
  return data
}

function storeContentsData(node, childData, containersToWrite){
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
  if (node.contentsWeightChanged || node.contentsValueChanged){
    containersToWrite.push(node);
  }
}
