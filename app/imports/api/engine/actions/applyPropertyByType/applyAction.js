import recalculateInlineCalculations from './shared/recalculateInlineCalculations.js';
import recalculateCalculation from './shared/recalculateCalculation.js';
import rollDice from '/imports/parser/rollDice.js';
import applyProperty from '../applyProperty.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { adjustQuantityWork } from '/imports/api/creature/creatureProperties/methods/adjustQuantity.js';
import { damagePropertyWork } from '/imports/api/creature/creatureProperties/methods/damageProperty.js';
import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';

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

  const attack = prop.attackRoll || prop.attackRollBonus;

  // Attack if there is an attack roll
  if (attack && attack.calculation){
    if (targets.length){
      targets.forEach(target => {
        applyAttackToTarget({attack, target, scope, log});
        // Apply the children, but only to the current target
        applyChildren(node, {targets: [target], scope, log});
      });
    } else {
      applyAttackWithoutTarget({attack, scope, log});
      applyChildren(node, {creature, targets, scope, log});
    }
  } else {
    applyChildren(node, {creature, targets, scope, log});
  }
}

function applyAttackWithoutTarget({attack, scope, log}){
  delete scope['$attackHit'];
  delete scope['$attackMiss'];
  delete scope['$criticalHit'];
  delete scope['$criticalMiss'];
  delete scope['$attackRoll'];

  recalculateCalculation(attack, scope, log);

  let {
    resultPrefix,
    result,
    criticalHit,
    criticalMiss,
  } = rollAttack(attack, scope);
  let name = criticalHit ? 'Critical Hit!' : criticalMiss ? 'Critical Miss!' : 'To Hit';
  if (scope['$attackAdvantage'] === 1){
    name += ' (Advantage)';
  } else if(scope['$attackAdvantage'] === -1){
    name += ' (Disadvantage)';
  }
  log.content.push({
    name,
    value: `${resultPrefix} **${result}**`,
  });
}

function applyAttackToTarget({attack, target, scope, log}){
  delete scope['$attackHit'];
  delete scope['$attackMiss'];
  delete scope['$criticalHit'];
  delete scope['$criticalMiss'];
  delete scope['$attackDiceRoll'];
  delete scope['$attackRoll'];

  recalculateCalculation(attack, scope, log);

  let {
    resultPrefix,
    result,
    criticalHit,
    criticalMiss,
  } = rollAttack(attack, scope);

  if (target.variables.armor){
    const armor = target.variables.armor.value;

    let name = criticalHit ? 'Critical Hit!' :
      criticalMiss ? 'Critical Miss!' :
      result > armor ? 'Hit!' : 'Miss!';
    if (scope['$attackAdvantage'] === 1){
      name += ' (Advantage)';
    } else if(scope['$attackAdvantage'] === -1){
      name += ' (Disadvantage)';
    }

    log.content.push({
      name,
      value: `${resultPrefix} **${result}**`,
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
      name: criticalHit ? 'Critical Hit!' : criticalMiss ? 'Critical Miss!' : 'To Hit',
      value: `${resultPrefix} **${result}**`,
    });
  }
}

function rollAttack(attack, scope){
  const rollModifierText = numberToSignedString(attack.value, true);
  let value, resultPrefix;
  if (attack.advantage === 1 || scope['$attackAdvantage']){
    const [a, b] = rollDice(2, 20);
    if (a >= b) {
      value = a;
      resultPrefix = `1d20 [ ${a}, ~~${b}~~ ] ${rollModifierText} = `;
    } else {
      value = b;
      resultPrefix = `1d20 [ ~~${a}~~, ${b} ] ${rollModifierText} = `;
    }
  } else if (attack.advantage === -1 || scope['$attackDisadvantage']){
    const [a, b] = rollDice(2, 20);
    if (a <= b) {
      value = a;
      resultPrefix = `1d20 [ ${a}, ~~${b}~~ ] ${rollModifierText} = `;
    } else {
      value = b;
      resultPrefix = `1d20 [ ~~${a}~~, ${b} ] ${rollModifierText} = `;
    }
  } else {
    value = rollDice(1, 20)[0];
    resultPrefix = `1d20 [${value}] ${rollModifierText} = `
  }
  scope['$attackRoll'] = {value};
  const result = value + attack.value;
  const {criticalHit, criticalMiss} = applyCrits(value, scope);
  return {resultPrefix, result, value, criticalHit, criticalMiss};
}

function applyCrits(value, scope){
  let criticalHitTarget = scope.criticalHitTarget?.value || 20;
  let criticalHit = value >= criticalHitTarget;
  let criticalMiss;
  if (criticalHit){
    scope['$criticalHit'] = {value: true};
    scope['$attackHit'] = {value: true};
  } else {
    criticalMiss = value === 1;
    if (criticalMiss){
      scope['$criticalMiss'] = 1;
      scope['$attackMiss'] = {value: true};
    } else {
      // Untargeted attacks hit by default
      scope['$attackHit'] = {value: true}
    }
  }
  return {criticalHit, criticalMiss};
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
