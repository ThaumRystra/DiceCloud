import CreatureProperties, { damagePropertyWork, adjustQuantityWork } from '/imports/api/creature/CreatureProperties.js';

export default function spendResources(action){
  // Check Uses
  if (action.usesUsed >= action.usesResult){
    throw new Meteor.Error('Insufficient Uses',
      'This action has no uses left');
  }
  // Resources
  if (action.insufficientResources){
    throw new Meteor.Error('Insufficient Resources',
      'This creature doesn\'t have sufficient resources to perform this action');
  }
  // Items
  let itemQuantityAdjustments = [];
  action.resources.itemsConsumed.forEach(itemConsumed => {
    if (!itemConsumed.itemId){
      throw new Meteor.Error('Ammo not selected',
        'No ammo was selected for this action');
    }
    let item = CreatureProperties.findOne(itemConsumed.itemId);
    if (!item || item.ancestors[0].id !== action.ancestors[0].id){
      throw new Meteor.Error('Ammo not found',
        'The action\'s ammo was not found on the creature');
    }
    if (!item.equipped){
      throw new Meteor.Error('Ammo not equipped',
        'The selected ammo is not equipped');
    }
    if (!itemConsumed.quantity) return;
    itemQuantityAdjustments.push({
      property: item,
      operation: 'increment',
      value: itemConsumed.quantity,
    });
  });
  // No more errors should be thrown after this line
  // Now that we have confirmed that there are no errors, do actual work
  //Items
  itemQuantityAdjustments.forEach(adjustQuantityWork);
  // Use uses
  CreatureProperties.update(action._id, {
    $inc: {usesUsed: 1}
  }, {
    selector: action
  });
  // Damage stats
  action.resources.attributesConsumed.forEach(attConsumed => {
    if (!attConsumed.quantity) return;
    let stat = CreatureProperties.findOne(attConsumed.statId);
    damagePropertyWork({
      property: stat,
      operation: 'increment',
      value: attConsumed.quantity,
    });
  });
}
