import evaluateCalculation from '/imports/api/creature/computation/evaluateCalculation.js';

export default function computeEndStepProperty(prop, memo){
  switch (prop.type){
    case 'action':
    case 'spell':
      computeAction(prop, memo);
      break;
    case 'adjustment':
    case 'damage':
      computePropertyField(prop, memo, 'amount', 'compile');
      break;
    case 'attack':
      computeAction(prop, memo);
      computeAttack(prop, memo);
      break;
    case 'savingThrow':
      computeSavingThrow(prop, memo);
      break;
    case 'spellList':
      computeSpellList(prop, memo);
      break;
    case 'propertySlot':
      computeSlot(prop, memo);
      break;
  }
}

function computeAction(prop, memo){
  // Uses
  let {
    result,
    context,
    dependencies,
  } = evaluateCalculation(prop.uses, memo);
  prop.usesResult = result.value;
  prop.dependencies.push(...dependencies);
  if (context.errors.length){
    prop.usesErrors = context.errors;
  } else {
    delete prop.usesErrors;
  }
  prop.insufficientResources = undefined;
  if (prop.usesUsed >= prop.usesResult){
    prop.insufficientResources = true;
  }
  if (!prop.resources) return;
  // Attributes consumed
  prop.resources.attributesConsumed.forEach((attConsumed, i) => {
    if (attConsumed.variableName){
      let stat = memo.statsByVariableName[attConsumed.variableName];
      prop.resources.attributesConsumed[i].statId = stat && stat._id;
      prop.resources.attributesConsumed[i].statName = stat && stat.name;
      let available = stat && stat.currentValue || 0;
      prop.resources.attributesConsumed[i].available = available;
      if (available < attConsumed.quantity){
        prop.insufficientResources = true;
      }
      if (stat) prop.dependencies.push(stat._id, ...stat.dependencies);
    }
  });
  // Items consumed
  prop.resources.itemsConsumed.forEach((itemConsumed, i) => {
    let item = itemConsumed.itemId && memo.equipmentById[itemConsumed.itemId];
    prop.resources.itemsConsumed[i].itemId = item && item._id;
    let available = item && item.quantity || 0;
    prop.resources.itemsConsumed[i].available = available;
    let name = item && item.name;
    if (item && item.quantity !== 1 && item.plural){
      name = item.plural;
    }
    prop.resources.itemsConsumed[i].itemName = name;
    prop.resources.itemsConsumed[i].itemIcon = item && item.icon;
    prop.resources.itemsConsumed[i].itemColor = item && item.color;
    if (!item || available < itemConsumed.quantity){
      prop.insufficientResources = true;
    }
    if (item) prop.dependencies.push(item._id, ...item.dependencies);
  });
}

function computePropertyField(prop, memo, fieldName, fn){
  let {
    result,
    context,
    dependencies,
  } = evaluateCalculation(prop[fieldName], memo, fn);
  prop[`${fieldName}Result`] = result.value;
  prop.dependencies.push(...dependencies);
  if (context.errors.length){
    prop[`${fieldName}Errors`] = context.errors;
  } else {
    delete prop[`${fieldName}Errors`];
  }
}

function computeAttack(prop, memo){
  computePropertyField(prop, memo, 'rollBonus');
}

function computeSavingThrow(prop, memo){
  computePropertyField(prop, memo, 'dc');
}

function computeSpellList(prop, memo){
  computePropertyField(prop, memo, 'maxPrepared');
}

function computeSlot(prop, memo){
  computePropertyField(prop, memo, 'slotCondition');
}
