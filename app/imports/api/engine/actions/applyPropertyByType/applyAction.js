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

  // Log the name and description
  let content = { name: prop.name };
  if (prop.description?.text){
    recalculateInlineCalculations(prop.description, scope, log);
    content.value = prop.description.value;
  }
  if (content.name || content.value){
    log.content.push(content);
  }

  // Spend the resources
  const failed = spendResources({prop, log, scope});
  if (failed) return;

  // Attack if there is an attack roll
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
  } else {
    applyChildren(node, {creature, targets, scope, log});
  }
}

function applyAttackWithoutTarget({prop, scope, log}){
  delete scope['$attackHit'];
  delete scope['$attackMiss'];
  delete scope['$criticalHit'];
  delete scope['$criticalMiss'];
  delete scope['$attackRoll'];

  recalculateCalculation(prop.attackRoll, scope, log);

  let value = rollDice(1, 20)[0];
  scope['$attackRoll'] = {value};
  let criticalHitTarget = scope.criticalHitTarget?.value || 20;
  let criticalHit = value >= criticalHitTarget;
  if (criticalHit){
    scope['$criticalHit'] = {value: true};
    scope['$attackHit'] = {value: true};
  } else {
    let criticalMiss = value === 1;
    if (criticalMiss){
      scope['$criticalMiss'] = 1;
      log.content.push({
        name: 'Critical Miss!',
      });
      scope['$attackMiss'] = {value: true};
    } else {
      // Untargeted attacks hit by default
      scope['$attackHit'] = {value: true}
    }
  }
  let result = value + prop.attackRoll.value;
  scope['$attackRoll'] = {value: result};
  log.content.push({
    name: criticalHit ? 'Critical Hit!' : 'To Hit',
    value: `1d20 [${value}] + ${prop.attackRoll.value} = ` + result,
  });
}

function applyAttackToTarget({prop, target, scope, log}){
  delete scope['$attackHit'];
  delete scope['$attackMiss'];
  delete scope['$criticalHit'];
  delete scope['$criticalMiss'];
  delete scope['$attackDiceRoll'];
  delete scope['$attackRoll'];

  recalculateCalculation(prop.attackRoll, scope, log);

  const value = rollDice(1, 20)[0];
  scope['$attackDiceRoll'] = {value};
  const criticalHitTarget = scope.criticalHitTarget?.value || 20;
  const criticalHit = value >= criticalHitTarget;
  const criticalMiss = value === 1;
  if (criticalHit) scope['$criticalHit'] = {value: true};
  if (criticalMiss) scope['$criticalMiss'] = {value: true};
  const result = value + prop.attackRoll.value;
  scope['$attackRoll'] = {value: result};
  if (target.variables.armor){
    const armor = target.variables.armor.value;
    const name = criticalHit ? 'Critical Hit!' :
      criticalMiss ? 'Critical miss!' :
      result > armor ? 'Hit!' :
      'Miss!'
    log.content.push({
      name,
      value: `1d20 {${value}} + ${prop.attackRoll.value} = ` + result,
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
      value: `1d20 {${value}} + ${prop.attackRoll.value} = ` + result,
    });
  }
}

function applyChildren(node, args){
  node.children.forEach(child => applyProperty(child, args));
}

function spendResources({prop, log, scope}){
  // Check Uses
  if (prop.usesLeft < 0){
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
      recalculateCalculation(itemConsumed.quantity, scope, log);
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
      if (
        !itemConsumed.quantity.value ||
        !isFinite(itemConsumed.quantity.value)
      ) return;
      itemQuantityAdjustments.push({
        property: item,
        operation: 'increment',
        value: itemConsumed.quantity.value,
      });
      let logName = item.name;
      if (itemConsumed.quantity.value > 1 || itemConsumed.quantity.value < -1){
        logName = item.plural || logName;
      }
      if (itemConsumed.quantity.value > 0){
        spendLog.push(logName + ': ' + itemConsumed.quantity.value);
      } else if (itemConsumed.quantity.value < 0){
        gainLog.push(logName + ': ' + -itemConsumed.quantity.value);
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
  if (prop.usesLeft){
    CreatureProperties.update(prop._id, {
      $inc: {usesUsed: 1}
    }, {
      selector: prop
    });
    log.content.push({
      name: 'Uses left',
      value: prop.usesLeft - (prop.usesUsed || 0) - 1,
    });
  }

  // Damage stats
  prop.resources.attributesConsumed.forEach(attConsumed => {
    recalculateCalculation(attConsumed.quantity, scope, log);

    if (!attConsumed.quantity?.value) return;
    let stat = scope[attConsumed.variableName];
    if (!stat){
      spendLog.push(stat.name + ': ' + ' not found');
      return;
    }
    damagePropertyWork({
      property: stat,
      operation: 'increment',
      value: attConsumed.quantity.value,
    });
    if (attConsumed.quantity.value > 0){
      spendLog.push(stat.name + ': ' + attConsumed.quantity.value);
    } else if (attConsumed.quantity.value < 0){
      gainLog.push(stat.name + ': ' + -attConsumed.quantity.value);
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
