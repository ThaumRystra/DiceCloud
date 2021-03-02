import evaluateCalculation from '/imports/api/creature/computation/engine/evaluateCalculation.js';
import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';
import applyToggles from '/imports/api/creature/computation/engine/applyToggles.js';
import { union } from 'lodash';

export default function computeEndStepProperty(prop, memo){
  applyToggles(prop, memo);

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
      computePropertyField(prop, memo, 'rollBonus');
      break;
    case 'savingThrow':
      computePropertyField(prop, memo, 'dc');
      break;
    case 'spellList':
      computePropertyField(prop, memo, 'maxPrepared');
      computePropertyField(prop, memo, 'attackRollBonus');
      computePropertyField(prop, memo, 'dc');
      break;
    case 'propertySlot':
      computePropertyField(prop, memo, 'quantityExpected');
      computePropertyField(prop, memo, 'slotCondition');
      break;
    case 'roll':
      computePropertyField(prop, memo, 'roll', 'compile');
      break;
  }
}

function computeAction(prop, memo){
  // Uses
  let {
    result,
    context,
    dependencies,
  } = evaluateCalculation({ string: prop.uses, prop, memo});
  prop.usesResult = result.value;
  prop.dependencies = union(prop.dependencies, dependencies);
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
      if (stat){
        prop.dependencies = union(
          prop.dependencies,
          [stat._id],
          stat.dependencies
        );
      }
    }
  });
  // Items consumed
  prop.resources.itemsConsumed.forEach((itemConsumed, i) => {
    let item = itemConsumed.itemId ?
      memo.equipmentById[itemConsumed.itemId] :
      undefined;
    let available = item ? item.quantity : 0;
    prop.resources.itemsConsumed[i].available = available;
    if (!item || available < itemConsumed.quantity){
      prop.insufficientResources = true;
    }
    if (item){
      prop.resources.itemsConsumed[i].itemId = item._id;
      let name = item.name;
      if (item.quantity !== 1 && item.plural){
        name = item.plural;
      }
      if (name) prop.resources.itemsConsumed[i].itemName = name;
      if (item.icon) prop.resources.itemsConsumed[i].itemIcon = item.icon;
      if (item.color) prop.resources.itemsConsumed[i].itemColor = item.color;
      prop.dependencies = union(
        prop.dependencies,
        [item._id],
        item.dependencies
      );
    } else {
      delete prop.resources.itemsConsumed[i].itemId;
      delete prop.resources.itemsConsumed[i].itemName;
      delete prop.resources.itemsConsumed[i].itemIcon;
      delete prop.resources.itemsConsumed[i].itemColor;
    }
  });
}

function computePropertyField(prop, memo, fieldName, fn){
  let {
    result,
    context,
    dependencies,
  } = evaluateCalculation({string: prop[fieldName], prop, memo, fn});
  if (result instanceof ConstantNode){
    prop[`${fieldName}Result`] = result.value;
  } else {
    prop[`${fieldName}Result`] = result.toString();
  }
  prop.dependencies = union(prop.dependencies, dependencies);
  if (context.errors.length){
    prop[`${fieldName}Errors`] = context.errors;
  } else {
    delete prop[`${fieldName}Errors`];
  }
}
