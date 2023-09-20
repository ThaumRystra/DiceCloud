import recalculateInlineCalculations from './shared/recalculateInlineCalculations.js';
import recalculateCalculation from './shared/recalculateCalculation.js';
import rollDice from '/imports/parser/rollDice.js';
import applyProperty from '../applyProperty.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import applyChildren from '/imports/api/engine/actions/applyPropertyByType/shared/applyChildren.js';
import { damagePropertyWork } from '/imports/api/creature/creatureProperties/methods/damageProperty.js';
import numberToSignedString from '/imports/api/utility/numberToSignedString.js';
import { applyNodeTriggers } from '/imports/api/engine/actions/applyTriggers.js';
import { resetProperties } from '/imports/api/creature/creatures/methods/restCreature.js';

export default function applyAction(node, actionContext) {
  applyNodeTriggers(node, 'before', actionContext);
  const prop = node.node;
  if (prop.target === 'self') actionContext.targets = [actionContext.creature];
  const targets = actionContext.targets;

  // Log the name and summary
  let content = { name: prop.name };
  if (prop.summary?.text) {
    recalculateInlineCalculations(prop.summary, actionContext);
    content.value = prop.summary.value;
  }
  if (!prop.silent) actionContext.addLog(content);

  // Spend the resources
  const failed = spendResources(prop, actionContext);
  if (failed) return;

  const attack = prop.attackRoll || prop.attackRollBonus;

  // Attack if there is an attack roll
  if (attack && attack.calculation) {
    if (targets.length) {
      targets.forEach(target => {
        applyAttackToTarget({ attack, target, actionContext });
        // Apply the children, but only to the current target
        actionContext.targets = [target];
        applyChildren(node, actionContext);
      });
    } else {
      applyAttackWithoutTarget({ attack, actionContext });
      applyChildren(node, actionContext);
    }
  } else {
    applyChildren(node, actionContext);
  }
  if (prop.actionType === 'event' && prop.variableName) {
    resetProperties(actionContext.creature._id, prop.variableName, actionContext);
  }
}

function applyAttackWithoutTarget({ attack, actionContext }) {
  delete actionContext.scope['~attackHit'];
  delete actionContext.scope['~attackMiss'];
  delete actionContext.scope['~criticalHit'];
  delete actionContext.scope['~criticalMiss'];
  delete actionContext.scope['~attackRoll'];

  recalculateCalculation(attack, actionContext);
  const scope = actionContext.scope;
  let {
    resultPrefix,
    result,
    criticalHit,
    criticalMiss,
  } = rollAttack(attack, scope);
  let name = criticalHit ? 'Critical Hit!' : criticalMiss ? 'Critical Miss!' : 'To Hit';
  if (scope['~attackAdvantage']?.value === 1) {
    name += ' (Advantage)';
  } else if (scope['~attackAdvantage']?.value === -1) {
    name += ' (Disadvantage)';
  }
  if (!criticalMiss) {
    scope['~attackHit'] = { value: true }
  }
  if (!criticalHit) {
    scope['~attackMiss'] = { value: true };
  }

  actionContext.addLog({
    name,
    value: `${resultPrefix}\n**${result}**`,
    inline: true,
  });
}

function applyAttackToTarget({ attack, target, actionContext }) {
  const scope = actionContext.scope;
  delete scope['~attackHit'];
  delete scope['~attackMiss'];
  delete scope['~criticalHit'];
  delete scope['~criticalMiss'];
  delete scope['~attackDiceRoll'];
  delete scope['~attackRoll'];

  recalculateCalculation(attack, actionContext);

  let {
    resultPrefix,
    result,
    criticalHit,
    criticalMiss,
  } = rollAttack(attack, scope);

  if (target.variables.armor) {
    const armor = target.variables.armor.value;

    let name = criticalHit ? 'Critical Hit!' :
      criticalMiss ? 'Critical Miss!' :
        result > armor ? 'Hit!' : 'Miss!';
    if (scope['~attackAdvantage']?.value === 1) {
      name += ' (Advantage)';
    } else if (scope['~attackAdvantage']?.value === -1) {
      name += ' (Disadvantage)';
    }

    actionContext.addLog({
      name,
      value: `${resultPrefix}\n**${result}**`,
      inline: true,
    });
    if (criticalMiss || result < armor) {
      scope['~attackMiss'] = { value: true };
    } else {
      scope['~attackHit'] = { value: true };
    }
  } else {
    actionContext.addLog({
      name: 'Error',
      value: 'Target has no `armor`',
    });
    actionContext.addLog({
      name: criticalHit ? 'Critical Hit!' : criticalMiss ? 'Critical Miss!' : 'To Hit',
      value: `${resultPrefix}\n**${result}**`,
      inline: true,
    });
  }
}

function rollAttack(attack, scope) {
  const rollModifierText = numberToSignedString(attack.value, true);
  let value, resultPrefix;
  if (scope['~attackAdvantage']?.value === 1) {
    const [a, b] = rollDice(2, 20);
    if (a >= b) {
      value = a;
      resultPrefix = `1d20 [ ${a}, ~~${b}~~ ] ${rollModifierText}`;
    } else {
      value = b;
      resultPrefix = `1d20 [ ~~${a}~~, ${b} ] ${rollModifierText}`;
    }
  } else if (scope['~attackAdvantage']?.value === -1) {
    const [a, b] = rollDice(2, 20);
    if (a <= b) {
      value = a;
      resultPrefix = `1d20 [ ${a}, ~~${b}~~ ] ${rollModifierText}`;
    } else {
      value = b;
      resultPrefix = `1d20 [ ~~${a}~~, ${b} ] ${rollModifierText}`;
    }
  } else {
    value = rollDice(1, 20)[0];
    resultPrefix = `1d20 [${value}] ${rollModifierText}`
  }
  scope['~attackDiceRoll'] = { value };
  const result = value + attack.value;
  scope['~attackRoll'] = { value: result };
  const { criticalHit, criticalMiss } = applyCrits(value, scope);
  return { resultPrefix, result, value, criticalHit, criticalMiss };
}

function applyCrits(value, scope) {
  let scopeCrit = scope['~criticalHitTarget']?.value;
  if (scopeCrit?.parseType === 'constant') {
    scopeCrit = scopeCrit.value;
  }
  const criticalHitTarget = scopeCrit || 20;
  let criticalHit = value >= criticalHitTarget;
  let criticalMiss;
  if (criticalHit) {
    scope['~criticalHit'] = { value: true };
  } else {
    criticalMiss = value === 1;
    if (criticalMiss) {
      scope['~criticalMiss'] = { value: true };
    }
  }
  return { criticalHit, criticalMiss };
}

function spendResources(prop, actionContext) {
  // Check Uses
  if (prop.usesLeft <= 0) {
    if (!prop.silent) actionContext.addLog({
      name: 'Error',
      value: `${prop.name || 'action'} does not have enough uses left`,
    });
    return true;
  }
  // Resources
  if (prop.insufficientResources) {
    if (!prop.silent) actionContext.addLog({
      name: 'Error',
      value: 'This creature doesn\'t have sufficient resources to perform this action',
    });
    return true;
  }
  // Items
  let spendLog = [];
  let gainLog = [];
  const ammoToApply = [];
  try {
    prop.resources.itemsConsumed.forEach(itemConsumed => {
      recalculateCalculation(itemConsumed.quantity, actionContext);
      if (!itemConsumed.itemId) {
        throw 'No ammo was selected for this prop';
      }
      let item = CreatureProperties.findOne(itemConsumed.itemId);
      if (!item || item.ancestors[0].id !== prop.ancestors[0].id) {
        throw 'The prop\'s ammo was not found on the creature';
      }
      if (
        !itemConsumed?.quantity?.value ||
        !isFinite(itemConsumed.quantity.value)
      ) return;
      let logName = item.name;
      if (itemConsumed.quantity.value > 1 || itemConsumed.quantity.value < -1) {
        logName = item.plural || logName;
      }
      if (itemConsumed.quantity.value > 0) {
        spendLog.push(logName + ': ' + itemConsumed.quantity.value);
      } else if (itemConsumed.quantity.value < 0) {
        gainLog.push(logName + ': ' + -itemConsumed.quantity.value);
      }
      // So long as the item isn't an ancestor of the current prop apply it
      // If it was an ancestor this would be an infinite loop
      if (!hasAncestorRelationship(item, prop)) {
        ammoToApply.push({
          node: {
            ...item,
            // Use ammo pseudo-type
            type: 'ammo',
            // Store the adjustment to be applied
            adjustment: itemConsumed.quantity.value,
          },
          children: []
        });
      }
    });
  } catch (e) {
    actionContext.addLog({
      name: 'Error',
      value: e.toString(),
    });
    console.error(e);
    return true;
  }
  // No more errors should be thrown after this line

  // Use uses
  if (prop.usesLeft) {
    CreatureProperties.update(prop._id, {
      $inc: { usesUsed: 1 }
    }, {
      selector: prop
    });
    if (!prop.silent) actionContext.addLog({
      name: 'Uses left',
      value: prop.usesLeft - 1,
      inline: true,
    });
  }

  // Damage stats
  prop.resources.attributesConsumed.forEach(attConsumed => {
    recalculateCalculation(attConsumed.quantity, actionContext);

    if (!attConsumed.quantity?.value) return;
    if (!attConsumed.variableName) return;
    let stat = actionContext.scope[attConsumed.variableName];
    if (!stat) {
      spendLog.push(attConsumed.variableName + ': ' + ' not found');
      return;
    }
    damagePropertyWork({
      prop: stat,
      operation: 'increment',
      value: attConsumed.quantity.value,
      actionContext,
    });
    if (attConsumed.quantity.value > 0) {
      spendLog.push(stat.name + ': ' + attConsumed.quantity.value);
    } else if (attConsumed.quantity.value < 0) {
      gainLog.push(stat.name + ': ' + -attConsumed.quantity.value);
    }
  });

  // Apply the ammo children
  ammoToApply.forEach(node => {
    applyProperty(node, actionContext);
  });

  // Log all the spending
  if (gainLog.length && !prop.silent) actionContext.addLog({
    name: 'Gained',
    value: gainLog.join('\n'),
    inline: true,
  });
  if (spendLog.length && !prop.silent) actionContext.addLog({
    name: 'Spent',
    value: spendLog.join('\n'),
    inline: true,
  });
}

function hasAncestorRelationship(a, b) {
  let top, bottom;
  if (a.ancestors.length === b.ancestors.length) {
    // Can't be ancestors of one another if they have the same number of ancestors
    return false;
  } else if (a.ancestors.length > b.ancestors.length) {
    // longer ancestor list goes on the bottom
    top = b;
    bottom = a;
  } else {
    top = a;
    bottom = b;
  }
  const expectedAncestorPosition = top.ancestors.length;
  return bottom.ancestors[expectedAncestorPosition]?.id === top._id;
}
