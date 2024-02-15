import { EngineAction } from '/imports/api/engine/action/EngineActions';
import { PropTask } from '../tasks/Task';
import TaskResult, { LogContent } from '../tasks/TaskResult';
import { getPropertiesOfType } from '/imports/api/engine/loadCreatures';
import applyTask from '/imports/api/engine/action/tasks/applyTask';
import getPropertyTitle from '/imports/api/utility/getPropertyTitle';
import recalculateInlineCalculations from '/imports/api/engine/action/functions/recalculateInlineCalculations';
import spendResources from '/imports/api/engine/action/functions/spendResources';
import { applyAfterChildrenTriggers, applyAfterTriggers, applyChildren } from '/imports/api/engine/action/functions/applyTaskGroups';
import recalculateCalculation from '/imports/api/engine/action/functions/recalculateCalculation';
import { getEffectiveActionScope } from '/imports/api/engine/action/functions/getEffectiveActionScope';
import numberToSignedString from '/imports/api/utility/numberToSignedString';
import rollDice from '/imports/parser/rollDice';

export default async function applyActionProperty(
  task: PropTask, action: EngineAction, result: TaskResult, userInput
): Promise<void> {
  const prop = task.prop;
  const targetIds = prop.target === 'self' ? [action.creatureId] : task.targetIds;

  //Log the name and summary, check that the property has enough resources to fire
  const content: LogContent = { name: prop.name };
  if (prop.summary?.text) {
    await recalculateInlineCalculations(prop.summary, action);
    content.value = prop.summary.value;
  }
  if (prop.silent) content.silenced = true;
  result.appendLog(content, targetIds);

  // Check Uses
  if (prop.usesLeft <= 0) {
    if (!prop.silent) result.appendLog({
      name: 'Error',
      value: `${prop.name || 'action'} does not have enough uses left`,
    }, targetIds);
    return;
  }

  // Check Resources
  if (prop.insufficientResources) {
    if (!prop.silent) result.appendLog({
      name: 'Error',
      value: 'This creature doesn\'t have sufficient resources to perform this action',
    }, targetIds);
    return;
  }

  spendResources(action, prop, targetIds, result, userInput);

  const attack = prop.attackRoll || prop.attackRollBonus;

  // Attack if there is an attack roll
  if (attack && attack.calculation) {
    if (targetIds.length) {
      for (const target of targetIds) {
        await applyAttackToTarget(action, prop, attack, targetIds, result, userInput);
        await applyAfterTriggers(action, prop, [target], userInput);
        await applyChildren(action, prop, [target], userInput);
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

async function applyAttackToTarget(action, prop, attack, target, taskResult: TaskResult, userInput) {
  taskResult.pushScope = {
    '~attackHit': {},
    '~attackMiss': {},
    '~criticalHit': {},
    '~criticalMiss': {},
    '~attackRoll': {},
  }

  await recalculateCalculation(attack, action, 'reduce');
  const scope = await getEffectiveActionScope(action);
  const contents: LogContent[] = [];

  const {
    resultPrefix,
    result,
    criticalHit,
    criticalMiss,
  } = await rollAttack(attack, scope, taskResult.pushScope);

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

    contents.push({
      name,
      value: `${resultPrefix}\n**${result}**`,
      inline: true,
      silenced: prop.silent,
    });

    if (criticalMiss || result < armor) {
      scope['~attackMiss'] = { value: true };
    } else {
      scope['~attackHit'] = { value: true };
    }
  } else {
    contents.push({
      name: 'Error',
      value: 'Target has no `armor`',
      inline: true,
      silenced: prop.silent,
    }, {
      name: criticalHit ? 'Critical Hit!' : criticalMiss ? 'Critical Miss!' : 'To Hit',
      value: `${resultPrefix}\n**${result}**`,
      inline: true,
      silenced: prop.silent,
    });
  }
  if (contents.length) {
    taskResult.mutations.push({
      contents,
      targetIds: [target],
    });
  }
}

async function applyAttackWithoutTarget(action, prop, attack, taskResult: TaskResult, userInput) {
  taskResult.pushScope = {
    '~attackHit': {},
    '~attackMiss': {},
    '~criticalHit': {},
    '~criticalMiss': {},
    '~attackRoll': {},
  }
  await recalculateCalculation(attack, action, 'reduce');
  const scope = await getEffectiveActionScope(action);
  const {
    resultPrefix,
    result,
    criticalHit,
    criticalMiss,
  } = await rollAttack(attack, scope, taskResult.pushScope);
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
      silenced: prop.silent,
    }],
    targetIds: [],
  });
}

async function rollAttack(attack, scope, resultPushScope) {
  const rollModifierText = numberToSignedString(attack.value, true);
  let value, resultPrefix;
  if (scope['~attackAdvantage']?.value === 1) {
    const [a, b] = await rollDice(2, 20);
    if (a >= b) {
      value = a;
      resultPrefix = `1d20 [ ${a}, ~~${b}~~ ] ${rollModifierText}`;
    } else {
      value = b;
      resultPrefix = `1d20 [ ~~${a}~~, ${b} ] ${rollModifierText}`;
    }
  } else if (scope['~attackAdvantage']?.value === -1) {
    const [a, b] = await rollDice(2, 20);
    if (a <= b) {
      value = a;
      resultPrefix = `1d20 [ ${a}, ~~${b}~~ ] ${rollModifierText}`;
    } else {
      value = b;
      resultPrefix = `1d20 [ ~~${a}~~, ${b} ] ${rollModifierText}`;
    }
  } else {
    value = await rollDice(1, 20)[0];
    resultPrefix = `1d20 [${value}] ${rollModifierText}`
  }
  resultPushScope['~attackDiceRoll'] = { value };
  const result = value + attack.value;
  resultPushScope['~attackRoll'] = { value: result };
  const { criticalHit, criticalMiss } = applyCrits(value, scope, resultPushScope);
  return { resultPrefix, result, value, criticalHit, criticalMiss };
}

function applyCrits(value, scope, resultPushScope) {
  let scopeCrit = scope['~criticalHitTarget']?.value;
  if (scopeCrit?.parseType === 'constant') {
    scopeCrit = scopeCrit.value;
  }
  const criticalHitTarget = scopeCrit || 20;
  const criticalHit = value >= criticalHitTarget;
  let criticalMiss;
  if (criticalHit) {
    resultPushScope['~criticalHit'] = { value: true };
  } else {
    criticalMiss = value === 1;
    if (criticalMiss) {
      resultPushScope['~criticalMiss'] = { value: true };
    }
  }
  return { criticalHit, criticalMiss };
}

async function resetProperties(action: EngineAction, prop: any, result: TaskResult, userInput) {
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
        silenced: prop.silent,
      }]
    });
  }
}