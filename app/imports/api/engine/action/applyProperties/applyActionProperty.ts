import { EngineAction } from '/imports/api/engine/action/EngineActions';
import { PropTask } from '../tasks/Task';
import TaskResult, { LogContent } from '../tasks/TaskResult';
import { getPropertiesOfType, getVariables } from '/imports/api/engine/loadCreatures';
import applyTask from '/imports/api/engine/action/tasks/applyTask';
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

export default async function applyActionProperty(
  task: PropTask, action: EngineAction, result: TaskResult, userInput: InputProvider
): Promise<void> {
  const prop = task.prop;
  const targetIds = prop.target === 'self' ? [action.creatureId] : task.targetIds;

  //Log the name and summary, check that the property has enough resources to fire
  if (prop.summary?.text) {
    await recalculateInlineCalculations(prop.summary, action, 'reduce', userInput);
  }
  result.appendLog({
    name: getPropertyTitle(prop),
    ...prop.summary && { value: prop.summary.value },
    ...prop.silent && { silenced: true },
  }, targetIds);

  // Check Uses
  if (prop.usesLeft <= 0) {
    result.appendLog({
      name: 'Error',
      value: `${getPropertyTitle(prop)} does not have enough uses left`,
      ...prop.silent && { silenced: true },
    }, targetIds);
    return;
  }

  // Check Resources
  if (prop.insufficientResources) {
    result.appendLog({
      name: 'Error',
      value: 'This creature doesn\'t have sufficient resources to perform this action',
      ...prop.silent && { silenced: true },
    }, targetIds);
    return;
  }

  await spendResources(action, prop, targetIds, result, userInput);

  const attack: CalculatedField = prop.attackRoll || prop.attackRollBonus;

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
    resetProperties(action, prop, result, userInput);
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
        result > targetArmor ? 'Hit!' : 'Miss!';
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
      scope['~attackMiss'] = { value: true };
    } else {
      scope['~attackHit'] = { value: true };
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
  } = await rollAttack(attack, scope, taskResult.pushScope, userInput);
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

async function resetProperties(action: EngineAction, prop: any, result: TaskResult, userInput: InputProvider) {
  const attributes = getPropertiesOfType(action.creatureId, 'attribute');
  for (const att of attributes) {
    if (att.removed || att.inactive) continue;
    if (att.reset !== prop.variableName) continue;
    if (!att.damage) continue;
    applyTask(action, {
      prop: att,
      targetIds: [action.creatureId],
      subtaskFn: 'damageProp',
      params: {
        title: getPropertyTitle(att),
        operation: 'increment',
        value: -att.damage ?? 0,
        targetProp: att,
      },
    }, userInput)
  }
  const actions = [
    ...getPropertiesOfType(action.creatureId, 'action'),
    ...getPropertiesOfType(action.creatureId, 'spell'),
  ]
  for (const act of actions) {
    if (act.removed || act.inactive) continue;
    if (act.reset !== prop.variableName) continue;
    if (!act.usesUsed) continue;
    result.mutations.push({
      targetIds: [action.creatureId],
      updates: [{
        propId: act._id,
        set: { usesUsed: 0 },
        type: act.type,
      }],
      contents: [{
        name: getPropertyTitle(act),
        value: act.usesUsed >= 0 ? `Restored ${act.usesUsed} uses` : `Removed ${-act.usesUsed} uses`,
        inline: true,
        ...prop.silent && { silenced: true },
      }]
    });
  }
}