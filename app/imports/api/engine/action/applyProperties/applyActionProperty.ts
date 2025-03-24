import { EngineAction } from '/imports/api/engine/action/EngineActions';
import { PropTask } from '../tasks/Task';
import TaskResult, { LogContent } from '../tasks/TaskResult';
import { getVariables } from '/imports/api/engine/loadCreatures';
import getPropertyTitle from '/imports/api/utility/getPropertyTitle';
import recalculateInlineCalculations from '/imports/api/engine/action/functions/recalculateInlineCalculations';
import spendResources from '/imports/api/engine/action/functions/spendResources';
import { applyAfterChildrenTriggers, applyAfterTriggers, applyChildren } from '/imports/api/engine/action/functions/applyTaskGroups';
import recalculateCalculation from '/imports/api/engine/action/functions/recalculateCalculation';
import { getEffectiveActionScope } from '/imports/api/engine/action/functions/getEffectiveActionScope';
import numberToSignedString from '/imports/api/utility/numberToSignedString';
import { getNumberFromScope } from '/imports/api/creature/creatures/CreatureVariables';
import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';
import { CalculatedField } from '/imports/api/properties/subSchemas/computedField';
import applyResetTask from '/imports/api/engine/action/tasks/applyResetTask';

export default async function applyActionProperty(
  task: PropTask, action: EngineAction, result: TaskResult, userInput: InputProvider
): Promise<void> {
  const prop = task.prop;
  if (prop.type !== 'action' && prop.type !== 'spell') {
    throw new Meteor.Error('wrong-property', `Expected an action or a spell, got ${prop.type} instead`);
  }
  const targetIds = prop.target === 'self' ? [action.creatureId] : task.targetIds;

  // If the action is a a spell, make sure we have spell slot defined
  if (prop.type === 'spell') {
    const scope = await getEffectiveActionScope(action);
    if (!('slotLevel' in scope)) {
      result.pushScope = {
        '~slotLevel': { value: prop.level },
        'slotLevel': { value: prop.level },
      };
    }
  }

  //Log the name and summary, check that the property has enough resources to fire
  if (prop.summary?.text) {
    await recalculateInlineCalculations(prop.summary, action, 'reduce', userInput);
  }
  result.appendLog({
    name: getPropertyTitle(prop),
    ...prop.summary && { value: prop.summary.value },
    silenced: prop.silent,
  }, targetIds);

  // Check Uses
  if (prop.usesLeft !== undefined && prop.usesLeft <= 0) {
    result.appendLog({
      name: 'Error',
      value: `${getPropertyTitle(prop)} does not have enough uses left`,
      silenced: prop.silent,
    }, targetIds);
    return;
  }

  // Check Resources
  if (prop.insufficientResources) {
    result.appendLog({
      name: 'Error',
      value: 'This creature doesn\'t have sufficient resources to perform this action',
      silenced: prop.silent,
    }, targetIds);
    return;
  }

  await spendResources(action, prop, targetIds, result, userInput);

  const attack = prop.attackRoll;

  // Attack if there is an attack roll
  if (attack && attack.calculation) {
    if (targetIds.length) {
      for (const targetId of targetIds) {
        await applyAttackToTarget(task, action, attack, targetId, result, userInput);
        await applyAfterTriggers(action, prop, [targetId], userInput);
        await applyChildren(action, prop, [targetId], userInput);
      }
    } else {
      await applyAttackWithoutTarget(action, prop, attack, result, userInput);
      await applyAfterTriggers(action, prop, targetIds, userInput);
      await applyChildren(action, prop, targetIds, userInput);
    }
  } else {
    await applyAfterTriggers(action, prop, targetIds, userInput);
    await applyChildren(action, prop, targetIds, userInput);
  }
  if (prop.actionType === 'event' && prop.variableName) {
    await applyResetTask({
      subtaskFn: 'reset',
      eventName: prop.variableName,
      targetIds: [action.creatureId],
    }, action, result, userInput);
  }

  // Finish
  return await applyAfterChildrenTriggers(action, prop, targetIds, userInput);
}

async function applyAttackToTarget(
  task: PropTask, action: EngineAction, attack: CalculatedField, targetId: string,
  taskResult: TaskResult, userInput: InputProvider
) {
  taskResult.pushScope = {
    '~attackHit': {},
    '~attackMiss': {},
    '~criticalHit': {},
    '~criticalMiss': {},
    '~attackRoll': {},
  }

  await recalculateCalculation(attack, action, 'reduce', userInput);
  const scope = await getEffectiveActionScope(action);
  const contents: LogContent[] = [];

  const {
    resultPrefix,
    result,
    criticalHit,
    criticalMiss,
    advantage
  } = await rollAttack(attack, scope, taskResult.pushScope, userInput);

  const targetScope = getVariables(targetId);
  const targetArmor = getNumberFromScope('armor', targetScope)

  if (targetArmor !== undefined) {
    let name = criticalHit ? 'Critical Hit!' :
      criticalMiss ? 'Critical Miss!' :
        result >= targetArmor ? 'Hit!' : 'Miss!';
    if (advantage === 1) {
      name += ' (Advantage)';
    } else if (advantage === -1) {
      name += ' (Disadvantage)';
    }

    contents.push({
      name,
      value: `${resultPrefix}\n**${result}**`,
      inline: true,
      ...task.prop.silent && { silenced: true },
    });

    if (criticalMiss || result < targetArmor) {
      taskResult.pushScope['~attackMiss'] = { value: true };
    } else {
      taskResult.pushScope['~attackHit'] = { value: true };
    }
  } else {
    contents.push({
      name: 'Error',
      value: 'Target has no `armor`',
      inline: true,
      ...task.prop.silent && { silenced: true },
    }, {
      name: criticalHit ? 'Critical Hit!' : criticalMiss ? 'Critical Miss!' : 'To Hit',
      value: `${resultPrefix}\n**${result}**`,
      inline: true,
      ...task.prop.silent && { silenced: true },
    });
  }
  if (contents.length) {
    taskResult.mutations.push({
      contents,
      targetIds: [targetId],
    });
  }
}

async function applyAttackWithoutTarget(action, prop, attack, taskResult: TaskResult, userInput: InputProvider) {
  taskResult.pushScope = {
    '~attackHit': {},
    '~attackMiss': {},
    '~criticalHit': {},
    '~criticalMiss': {},
    '~attackRoll': {},
  }
  await recalculateCalculation(attack, action, 'reduce', userInput);
  const scope = await getEffectiveActionScope(action);
  const {
    resultPrefix,
    result,
    criticalHit,
    criticalMiss,
    advantage,
  } = await rollAttack(attack, scope, taskResult.pushScope, userInput);
  let name = criticalHit ? 'Critical Hit!' : criticalMiss ? 'Critical Miss!' : 'To Hit';
  if (advantage === 1) {
    name += ' (Advantage)';
  } else if (advantage === -1) {
    name += ' (Disadvantage)';
  }
  if (!criticalMiss) {
    taskResult.pushScope['~attackHit'] = { value: true }
  }
  if (!criticalHit) {
    taskResult.pushScope['~attackMiss'] = { value: true };
  }
  taskResult.mutations.push({
    contents: [{
      name,
      value: `${resultPrefix}\n**${result}**`,
      inline: true,
      ...prop.silent && { silenced: true },
    }],
    targetIds: [],
  });
}

async function rollAttack(attack, scope: any, resultPushScope, userInput: InputProvider) {
  const advantage: 0 | 1 | -1 = await userInput.advantage(
    (!!attack.advantage && !attack.disadvantage) ? 1 :
      (!attack.advantage && !!attack.disadvantage) ? -1 :
        0
  );
  const rollModifierText = numberToSignedString(attack.value, true);
  let value, resultPrefix;

  if (advantage === 1) {
    const [[a, b]] = await userInput.rollDice([{ number: 2, diceSize: 20 }]);
    if (a >= b) {
      value = a;
      resultPrefix = `1d20 [ ${a}, ~~${b}~~ ] ${rollModifierText}`;
    } else {
      value = b;
      resultPrefix = `1d20 [ ~~${a}~~, ${b} ] ${rollModifierText}`;
    }
  } else if (advantage === -1) {
    const [[a, b]] = await userInput.rollDice([{ number: 2, diceSize: 20 }]);
    if (a <= b) {
      value = a;
      resultPrefix = `1d20 [ ${a}, ~~${b}~~ ] ${rollModifierText}`;
    } else {
      value = b;
      resultPrefix = `1d20 [ ~~${a}~~, ${b} ] ${rollModifierText}`;
    }
  } else {
    [[value]] = await userInput.rollDice([{ number: 1, diceSize: 20 }]);
    resultPrefix = `1d20 [${value}] ${rollModifierText}`
  }
  resultPushScope['~attackDiceRoll'] = { value };
  const result = value + attack.value;
  resultPushScope['~attackRoll'] = { value: result };
  const { criticalHit, criticalMiss } = applyCrits(value, scope, resultPushScope);
  return { resultPrefix, result, value, criticalHit, criticalMiss, advantage };
}

function applyCrits(value, scope, resultPushScope) {
  const scopeCritTarget = getNumberFromScope('~criticalHitTarget', scope);
  const criticalHitTarget = scopeCritTarget !== undefined &&
    Number.isFinite(scopeCritTarget) ? scopeCritTarget : 20;

  const scopeCritMissTarget = getNumberFromScope('~criticalMissTarget', scope);
  const criticalMissTarget = scopeCritMissTarget !== undefined &&
    Number.isFinite(scopeCritMissTarget) ? scopeCritMissTarget : 1;

  const criticalHit = value >= criticalHitTarget;
  const criticalMiss = value <= criticalMissTarget;
  if (criticalHit) {
    resultPushScope['~criticalHit'] = { value: true };
  } else if (criticalMiss) {
    resultPushScope['~criticalMiss'] = { value: true };
  }
  return { criticalHit, criticalMiss };
}
