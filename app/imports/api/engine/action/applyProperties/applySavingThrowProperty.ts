import { getFromScope } from '/imports/api/creature/creatures/CreatureVariables';
import { EngineAction } from '/imports/api/engine/action/EngineActions';
import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';
import { applyDefaultAfterPropTasks } from '/imports/api/engine/action/functions/applyTaskGroups';
import { getEffectiveActionScope } from '/imports/api/engine/action/functions/getEffectiveActionScope';
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
  const originalTargetIds = task.targetIds;

  const saveTargetIds = prop.target === 'self' ? [action.creatureId] : originalTargetIds;

  if (saveTargetIds.length > 1)

    recalculateCalculation(prop.dc, action, 'reduce', inputProvider);

  if (!isFiniteNode(prop.dc)) {
    result.appendLog({
      name: 'Error',
      value: 'Saving throw requires a DC',
    }, saveTargetIds);
    return applyDefaultAfterPropTasks(action, prop, saveTargetIds, inputProvider);
  }

  const dc = (prop.dc?.value);
  if (!prop.silent) result.appendLog({
    name: prop.name,
    value: `DC **${dc}**`,
    inline: true,
    ...prop.silent && { silenced: prop.silent }
  }, saveTargetIds);
  const scope = await getEffectiveActionScope(action);

  // If there are no save targets, apply all children as if the save both
  // succeeded and failed
  if (!saveTargetIds?.length) {
    result.scope = {
      ['~saveFailed']: { value: true },
      ['~saveSucceeded']: { value: true },
    }
    return applyDefaultAfterPropTasks(action, prop, saveTargetIds, inputProvider);
  }

  // Each target makes the saving throw
  for (const targetId of saveTargetIds) {

    const save = getFromScope('save', getVariables(targetId));

    if (!save) {
      result.appendLog({
        name: 'Saving throw error',
        value: 'No saving throw found: ' + prop.stat,
      }, [targetId]);
      applyDefaultAfterPropTasks(action, prop, [targetId], inputProvider);
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
    scope['~saveDiceRoll'] = { value };
    const resultValue = value + rollModifier || 0;
    scope['~saveRoll'] = { value: resultValue };
    const saveSuccess = resultValue >= dc;
    if (saveSuccess) {
      scope['~saveSucceeded'] = { value: true };
    } else {
      scope['~saveFailed'] = { value: true };
    }
    if (!prop.silent) result.appendLog({
      name: saveSuccess ? 'Successful save' : 'Failed save',
      value: resultPrefix + '\n**' + resultValue + '**',
      inline: true,
    }, [targetId]);
    return applyDefaultAfterPropTasks(action, prop, [targetId], inputProvider);
  }
}
