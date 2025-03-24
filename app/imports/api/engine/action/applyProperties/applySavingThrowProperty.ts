import { getFromScope } from '/imports/api/creature/creatures/CreatureVariables';
import { EngineAction } from '/imports/api/engine/action/EngineActions';
import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';
import { applyDefaultAfterPropTasks, applyTaskToEachTarget } from '/imports/api/engine/action/functions/applyTaskGroups';
import getPropertyTitle from '/imports/api/utility/getPropertyTitle';
import recalculateCalculation from '/imports/api/engine/action/functions/recalculateCalculation';
import { PropTask } from '/imports/api/engine/action/tasks/Task';
import TaskResult from '/imports/api/engine/action/tasks/TaskResult';
import { getVariables } from '/imports/api/engine/loadCreatures';
import numberToSignedString from '/imports/api/utility/numberToSignedString';
import { isFiniteNode } from '/imports/parser/parseTree/constant';

export default async function applySavingThrowProperty(
  task: PropTask, action: EngineAction, result: TaskResult, inputProvider: InputProvider
): Promise<void> {

  const prop = task.prop;

  const saveTargetIds = prop.target === 'self' ? [action.creatureId] : task.targetIds;

  if (saveTargetIds.length > 1) {
    return applyTaskToEachTarget(action, task, saveTargetIds, inputProvider);
  }

  recalculateCalculation(prop.dc, action, 'reduce', inputProvider);

  if (!isFiniteNode(prop.dc?.valueNode)) {
    result.appendLog({
      name: 'Error',
      value: 'Saving throw requires a DC',
      silenced: prop.silent,
    }, saveTargetIds);
    return applyDefaultAfterPropTasks(action, prop, saveTargetIds, inputProvider);
  }

  const dc = (prop.dc?.value);
  result.appendLog({
    name: getPropertyTitle(prop),
    value: `DC **${dc}**`,
    inline: true,
    silenced: prop.silent,
  }, saveTargetIds);

  const targetId = saveTargetIds[0];

  // If there are no save targets, apply all children as if the save both
  // succeeded and failed
  if (!targetId) {
    result.pushScope = {
      ['~saveFailed']: { value: true },
      ['~saveSucceeded']: { value: true },
    }
    return applyDefaultAfterPropTasks(action, prop, saveTargetIds, inputProvider);
  }

  // Each target makes the saving throw
  const save = getFromScope(prop.stat, getVariables(targetId));

  if (!save) {
    result.appendLog({
      name: 'Saving throw error',
      value: 'No saving throw found: ' + prop.stat,
      silenced: prop.silent,
    }, [targetId]);
    return applyDefaultAfterPropTasks(action, prop, [targetId], inputProvider);
  }

  const rollModifierText = numberToSignedString(save.value, true);
  const rollModifier = save.value;

  let value, resultPrefix;
  if (save.advantage === 1) {
    const [[a, b]] = await inputProvider.rollDice([{ number: 2, diceSize: 20 }]);
    if (a >= b) {
      value = a;
      resultPrefix = `Advantage\n1d20 [ ${a}, ~~${b}~~ ] ${rollModifierText}`;
    } else {
      value = b;
      resultPrefix = `Advantage\n1d20 [ ~~${a}~~, ${b} ] ${rollModifierText}`;
    }
  } else if (save.advantage === -1) {
    const [[a, b]] = await inputProvider.rollDice([{ number: 2, diceSize: 20 }]);
    if (a <= b) {
      value = a;
      resultPrefix = `Disadvantage\n1d20 [ ${a}, ~~${b}~~ ] ${rollModifierText}`;
    } else {
      value = b;
      resultPrefix = `Disadvantage\n1d20 [ ~~${a}~~, ${b} ] ${rollModifierText}`;
    }
  } else {
    const [[rolledValue]] = await inputProvider.rollDice([{ number: 1, diceSize: 20 }]);
    value = rolledValue;
    resultPrefix = `1d20 [ ${value} ] ${rollModifierText}`
  }
  result.pushScope = {};
  result.pushScope['~saveDiceRoll'] = { value };
  const resultValue = value + rollModifier || 0;
  result.pushScope['~saveRoll'] = { value: resultValue };
  const saveSuccess = resultValue >= dc;
  if (saveSuccess) {
    result.pushScope['~saveSucceeded'] = { value: true };
    result.pushScope['~saveFailed'] = { value: false };
  } else {
    result.pushScope['~saveFailed'] = { value: true };
    result.pushScope['~saveSucceeded'] = { value: false };
  }
  result.appendLog({
    name: saveSuccess ? 'Successful save' : 'Failed save',
    value: resultPrefix + '\n**' + resultValue + '**',
    inline: true,
    silenced: prop.silent,
  }, [targetId]);
  return applyDefaultAfterPropTasks(action, prop, [targetId], inputProvider);
}
