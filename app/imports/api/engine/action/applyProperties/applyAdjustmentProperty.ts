import { EngineAction } from '/imports/api/engine/action/EngineActions';
import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';
import { applyDefaultAfterPropTasks, applyTaskToEachTarget } from '/imports/api/engine/action/functions/applyTaskGroups';
import recalculateCalculation from '/imports/api/engine/action/functions/recalculateCalculation';
import { PropTask } from '/imports/api/engine/action/tasks/Task';
import TaskResult from '/imports/api/engine/action/tasks/TaskResult';
import applyTask from '/imports/api/engine/action/tasks/applyTask';
import { getSingleProperty, getVariables } from '/imports/api/engine/loadCreatures';
import getPropertyTitle from '/imports/api/utility/getPropertyTitle';

export default async function applyAdjustmentProperty(
  task: PropTask, action: EngineAction, result: TaskResult, userInput: InputProvider
): Promise<void> {
  const prop = task.prop;
  const damageTargetIds = prop.target === 'self' ? [action.creatureId] : task.targetIds;

  if (damageTargetIds.length > 1) {
    return await applyTaskToEachTarget(action, task, damageTargetIds, userInput);
  }

  // Get the operation and value and push the damage hooks to the queue
  if (!prop.amount) {
    return;
  }

  // Evaluate the amount
  await recalculateCalculation(prop.amount, action, 'reduce', userInput);
  const value = +prop.amount.value;
  if (!isFinite(value)) {
    return;
  }

  if (!damageTargetIds?.length) {
    return;
  }

  if (damageTargetIds.length !== 1) {
    throw 'At this step, only a single target is supported'
  }
  const targetId = damageTargetIds[0];
  const statId = getVariables(targetId)?.[prop.stat]?._propId;
  const stat = statId && getSingleProperty(targetId, statId);
  if (!stat?.type) {
    result.appendLog({
      name: 'Error',
      value: `Could not apply attribute damage, creature does not have \`${prop.stat}\` set`,
      silenced: prop.silent,
    }, damageTargetIds);
    return;
  }

  applyTask(action, {
    prop,
    targetIds: damageTargetIds,
    subtaskFn: 'damageProp',
    params: {
      title: getPropertyTitle(prop),
      operation: prop.operation,
      value,
      targetProp: stat,
    },
  }, userInput);
  return applyDefaultAfterPropTasks(action, prop, damageTargetIds, userInput);
}
