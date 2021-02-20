import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { adjustQuantityWork } from '/imports/api/creature/creatureProperties/methods/adjustQuantity.js';
import { damagePropertyWork } from '/imports/api/creature/creatureProperties/methods/damageProperty.js';

export default function spendResources({prop, log}){
  // Check Uses
  if (prop.usesUsed >= prop.usesResult){
    throw new Meteor.Error('Insufficient Uses',
      'This prop has no uses left');
  }
  // Resources
  if (prop.insufficientResources){
    throw new Meteor.Error('Insufficient Resources',
      'This creature doesn\'t have sufficient resources to perform this prop');
  }
  // Items
  let itemQuantityAdjustments = [];
  let spendLog = [];
  let gainLog = [];
  prop.resources.itemsConsumed.forEach(itemConsumed => {
    if (!itemConsumed.itemId){
      throw new Meteor.Error('Ammo not selected',
        'No ammo was selected for this prop');
    }
    let item = CreatureProperties.findOne(itemConsumed.itemId);
    if (!item || item.ancestors[0].id !== prop.ancestors[0].id){
      throw new Meteor.Error('Ammo not found',
        'The prop\'s ammo was not found on the creature');
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
    let logName = item.name;
    if (itemConsumed.quantity > 1 || itemConsumed.quantity < -1){
      logName = item.plural || logName;
    }
    if (itemConsumed.quantity > 0){
      spendLog.push(logName + ': ' + itemConsumed.quantity);
    } else if (itemConsumed.quantity < 0){
      gainLog.push(logName + ': ' + -itemConsumed.quantity);
    }
  });
  // No more errors should be thrown after this line
  // Now that we have confirmed that there are no errors, do actual work
  //Items
  itemQuantityAdjustments.forEach(adjustQuantityWork);

  // Use uses
  if (prop.usesResult){
    CreatureProperties.update(prop._id, {
      $inc: {usesUsed: 1}
    }, {
      selector: prop
    });
    log.content.push({
      name: 'Uses left',
      result: prop.usesResult - prop.usesUsed - 1,
    });
  }

  // Damage stats
  prop.resources.attributesConsumed.forEach(attConsumed => {
    if (!attConsumed.quantity) return;
    let stat = CreatureProperties.findOne(attConsumed.statId);
    damagePropertyWork({
      property: stat,
      operation: 'increment',
      value: attConsumed.quantity,
    });
    if (attConsumed.quantity > 0){
      spendLog.push(stat.name + ': ' + attConsumed.quantity);
    } else if (attConsumed.quantity < 0){
      gainLog.push(stat.name + ': ' + -attConsumed.quantity);
    }
  });

  // Log all the spending
  if (gainLog.length) log.content.push({
    name: 'Gained',
    description: gainLog.join('\n'),
  });
  if (spendLog.length) log.content.push({
    name: 'Spent',
    description: spendLog.join('\n'),
  });
}
