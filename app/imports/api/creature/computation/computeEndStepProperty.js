import evaluateCalculation from '/imports/api/creature/computation/evaluateCalculation.js';

export default function computeEndStepProperty(prop, memo){
  switch (prop.type){
    case 'action':
    case 'spell':
      computeAction(prop, memo);
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
  }
}

function computeAction(prop, memo){
  // Uses
  let {value, errors} = evaluateCalculation(prop.uses, memo);
  prop.usesResult = value;
  if (errors.length){
    prop.usesErrors = errors;
  } else {
    delete prop.usesErrors;
  }
  prop.insufficientResources = undefined;
  if (prop.usesUsed >= prop.usesResult){
    prop.insufficientResources = true;
  }
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
  });
}

function computeAttack(prop, memo){
  // Roll bonus
  let {value, errors} = evaluateCalculation(prop.rollBonus, memo);
  prop.rollBonusResult = value;
  if (errors.length){
    prop.rollBonusErrors = errors;
  } else {
    delete prop.rollBonusErrors;
  }
}

function computeSavingThrow(prop, memo){
  let {value, errors} = evaluateCalculation(prop.dc, memo);
  prop.dcResult = value;
  if (errors.length){
    prop.dcErrors = errors;
  } else {
    delete prop.dcErrors;
  }
}

function computeSpellList(prop, memo){
  let {value, errors} = evaluateCalculation(prop.maxPrepared, memo);
  prop.maxPreparedResult = value;
  if (errors.length){
    prop.maxPreparedErrors = errors;
  } else {
    delete prop.maxPreparedErrors;
  }
}

function computeSlot(prop, memo){
  let {value, errors} = evaluateCalculation(prop.slotCondition, memo);
  prop.slotConditionResult = value;
  if (errors.length){
    prop.slotConditionErrors = errors;
  } else {
    delete prop.slotConditionErrors;
  }
}
