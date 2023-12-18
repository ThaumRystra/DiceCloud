import recalculateInlineCalculations from './shared/recalculateInlineCalculations';
import recalculateCalculation from './shared/recalculateCalculation';
import rollDice from '/imports/parser/rollDice';
import applyProperty from '../applyProperty';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import applyChildren from '/imports/api/engine/actions/applyPropertyByType/shared/applyChildren';
import { damagePropertyWork } from '/imports/api/creature/creatureProperties/methods/damageProperty';
import numberToSignedString from '/imports/api/utility/numberToSignedString';
import { applyNodeTriggers } from '/imports/api/engine/actions/applyTriggers';
import { resetProperties } from '/imports/api/creature/creatures/methods/restCreature';
import { TreeNode, hasAncestorRelationship } from '/imports/api/parenting/parentingFunctions';
import { Action } from '/imports/api/properties/Actions';
import { LogContent } from '/imports/api/creature/log/LogContentSchema';
import { Item } from '/imports/api/properties/Items';

interface Ammo extends Item {
  type: 'ammo'
  adjustment: number
}

export default async function applyAction(node: TreeNode<Action>, actionContext) {
  applyNodeTriggers(node, 'before', actionContext);
  const prop = node.doc;
  if (prop.target === 'self') actionContext.targets = [actionContext.creature];
  const targets = actionContext.targets;

  // Log the name and summary
  const content: LogContent = { name: prop.name, };
  if (prop.summary?.text) {
    recalculateInlineCalculations(prop.summary, actionContext);
    content.value = prop.summary.value;
  }
  if (!prop.silent) actionContext.addLog(content);

  // Spend the resources
  const failed = await spendResources(prop, actionContext);
  if (failed) return;

  const attack = prop.attackRoll;

  // Attack if there is an attack roll
  if (attack && attack.calculation) {
    if (targets.length) {
      for (const target of targets) {
        await applyAttackToTarget({ attack, target, actionContext });
        // Apply the children, but only to the current target
        actionContext.targets = [target];
        await applyChildren(node, actionContext);
      }
    } else {
      await applyAttackWithoutTarget({ attack, actionContext });
      await applyChildren(node, actionContext);
    }
  } else {
    await applyChildren(node, actionContext);
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
  const {
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

  const {
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
  const criticalHit = value >= criticalHitTarget;
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

async function spendResources(prop: Action, actionContext) {
  // Check Uses
  if (!prop.usesLeft || prop.usesLeft <= 0) {
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
  const spendLog: string[] = [];
  const gainLog: string[] = [];
  const ammoToApply: TreeNode<Ammo>[] = [];
  try {
    prop.resources.itemsConsumed.forEach(itemConsumed => {
      recalculateCalculation(itemConsumed.quantity, actionContext);
      if (!itemConsumed.itemId) {
        throw 'No ammo was selected for this prop';
      }
      const item = CreatureProperties.findOne(itemConsumed.itemId) as Item;
      if (!item || item.root.id !== prop.root.id) {
        throw 'The prop\'s ammo was not found on the creature';
      }

      if (
        !itemConsumed?.quantity?.value ||
        !isFinite(+itemConsumed.quantity.value)
      ) return;
      const quantityConsumed = +itemConsumed.quantity.value;

      let logName = item.name;
      if (quantityConsumed > 1 || quantityConsumed < -1) {
        logName = item.plural || logName;
      }
      if (quantityConsumed > 0) {
        spendLog.push(logName + ': ' + quantityConsumed);
      } else if (quantityConsumed < 0) {
        gainLog.push(logName + ': ' + -quantityConsumed);
      }
      // So long as the item isn't an ancestor of the current prop apply it
      // If it was an ancestor this would be an infinite loop
      if (!hasAncestorRelationship(item, prop)) {
        ammoToApply.push({
          doc: {
            ...item,
            // Use ammo pseudo-type
            type: 'ammo',
            // Store the adjustment to be applied
            adjustment: quantityConsumed,
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
      //@ts-expect-error no typings for collection 2 selector
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
    const quantityConsumed = +attConsumed.quantity.value;
    if (!attConsumed.variableName) return;
    const stat = actionContext.scope[attConsumed.variableName];
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
    if (quantityConsumed > 0) {
      spendLog.push(stat.name + ': ' + quantityConsumed);
    } else if (quantityConsumed < 0) {
      gainLog.push(stat.name + ': ' + -quantityConsumed);
    }
  });

  // Apply the ammo children
  for (const node of ammoToApply) {
    await applyProperty(node, actionContext);
  }

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
