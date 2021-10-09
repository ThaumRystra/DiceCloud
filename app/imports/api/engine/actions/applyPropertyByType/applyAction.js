import recalculateInlineCalculations from './shared/recalculateInlineCalculations.js';
import recalculateCalculation from './shared/recalculateCalculation.js';
import rollDice from '/imports/parser/rollDice.js';
import applyProperty from '../applyProperty.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { adjustQuantityWork } from '/imports/api/creature/creatureProperties/methods/adjustQuantity.js';
import { damagePropertyWork } from '/imports/api/creature/creatureProperties/methods/damageProperty.js';

export default function applyAction(node, {creature, targets, scope, log}){
  const prop = node.node;
  if (prop.target === 'self') targets = [creature];
  const failed = spendResources({prop, log, scope});
  if (failed) return;

  let content = { name: prop.name };
  if (prop.summary?.text){
    recalculateInlineCalculations(prop.summary, scope, log);
    content.value = prop.summary.value;
  }
  log.content.push(content);
  if (prop.attackRoll && prop.attackRoll.calculation){
    if (targets.length){
      targets.forEach(target => {
        applyAttackToTarget({prop, target, scope, log});
        // Apply the children, but only to the current target
        applyChildren(node, {targets: [target], scope, log});
      });
    } else {
      applyAttackWithoutTarget({prop, scope, log});
      applyChildren(node, {creature, targets, scope, log});
    }
  }
}

function applyAttackWithoutTarget({prop, scope, log}){
  delete scope['$attackHit'];
  delete scope['$attackMiss'];

  recalculateCalculation(prop.rollBonus, scope, log);

  let value = rollDice(1, 20)[0];
  scope['$attackRoll'] = {value};
  let criticalHitTarget = scope.criticalHitTarget?.value || 20;
  let criticalHit = value >= criticalHitTarget;
  if (criticalHit) scope['$criticalHit'] = {value: true};
  let result = value + prop.rollBonus.value;
  scope['$toHit'] = {value: result};
  log.content.push({
    name: criticalHit ? 'Critical Hit!' : 'To Hit',
    value: `1d20 {${value}} + ${prop.rollBonus.value} = ` + result,
  });
}

function applyAttackToTarget({prop, target, scope, log}){
  delete scope['$attackHit'];
  delete scope['$attackMiss'];

  recalculateCalculation(prop.rollBonus, scope, log);

  const value = rollDice(1, 20)[0];
  scope['$attackRoll'] = {value};
  const criticalHitTarget = scope.criticalHitTarget?.value || 20;
  const criticalHit = value >= criticalHitTarget;
  const criticalMiss = value === 1;
  if (criticalHit) scope['$criticalHit'] = {value: true};
  if (criticalMiss) scope['$criticalMiss'] = {value: true};
  const result = value + prop.rollBonus.value;
  scope['$toHit'] = {value: result};
  if (target.variables.armor){
    const armor = target.variables.armor.value;
    const name = criticalHit ? 'Critical Hit!' :
      criticalMiss ? 'Critical miss!' :
      result > armor ? 'Hit!' :
      'Miss!'
    log.content.push({
      name,
      value: `1d20 {${value}} + ${prop.rollBonus.value} = ` + result,
    });
    if ((result > armor) || (criticalHit)){
      scope['$attackHit'] = true;
    } else {
      scope['$attackMiss'] = true;
    }
  } else {
    log.content.push({
      name: 'Error',
      value:'Target has no `armor`',
    });
    log.content.push({
      name: criticalHit ? 'Critical Hit!' : criticalMiss ? 'Critical miss!' : 'To Hit',
      value: `1d20 {${value}} + ${prop.rollBonus.value} = ` + result,
    });
  }
}

function applyChildren(node, args){
  node.children.forEach(child => applyProperty(child, args));
}

function spendResources({prop, log, scope}){
  // Check Uses
  if (prop.usesUsed >= prop.uses?.value){
    log.content.push({
      name: 'Error',
      value: `${prop.name || 'action'} does not have enough uses left`,
    });
    return true;
  }
  // Resources
  if (prop.insufficientResources){
    log.content.push({
      name: 'Error',
      value: 'This creature doesn\'t have sufficient resources to perform this action',
    });
    return true;
  }
  // Items
  let itemQuantityAdjustments = [];
  let spendLog = [];
  let gainLog = [];
  try {
    prop.resources.itemsConsumed.forEach(itemConsumed => {
      if (!itemConsumed.itemId){
        throw 'No ammo was selected for this prop';
      }
      let item = CreatureProperties.findOne(itemConsumed.itemId);
      if (!item || item.ancestors[0].id !== prop.ancestors[0].id){
        throw 'The prop\'s ammo was not found on the creature';
      }
      if (!item.equipped){
        throw 'The selected ammo is not equipped';
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
  } catch (e){
    log.content.push({
      name: 'Error',
      value: e,
    });
    return true;
  }
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
      value: prop.usesResult - (prop.usesUsed || 0) - 1,
    });
  }

  // Damage stats
  prop.resources.attributesConsumed.forEach(attConsumed => {
    if (!attConsumed.quantity) return;
    let stat = scope[attConsumed.variableName];
    if (!stat) return;
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
    value: gainLog.join('\n'),
  });
  if (spendLog.length) log.content.push({
    name: 'Spent',
    value: spendLog.join('\n'),
  });
}
