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
    return applyTaskToEachTarget(action, task, damageTargetIds, userInput);
  }

  // Get the operation and value and push the damage hooks to the queue
  if (!prop.amount) {
    result.appendLog({
      name: 'Error',
      value: 'Attribute damage does not have an amount set',
      silenced: prop.silent,
    }, damageTargetIds);
    return;
  }

  // Evaluate the amount
  await recalculateCalculation(prop.amount, action, 'reduce', userInput);
  const value = +prop.amount.value;
  if (!isFinite(value)) {
    result.appendLog({
      name: 'Error',
      value: 'Attribute damage does not have a finite amount set',
      silenced: prop.silent,
    }, damageTargetIds);
    return;
  }

  if (damageTargetIds.length && damageTargetIds.length !== 1) {
    throw new Meteor.Error('1 target Expected', 'At this step, only a single target is supported');
  }
  const targetId = damageTargetIds[0];
  let stat;
  if (targetId) {
    const statId = getVariables(targetId)?.[prop.stat]?._propId;
    stat = statId && getSingleProperty(targetId, statId);
    if (!stat?.type) {
      result.appendLog({
        name: 'Error',
        value: `Could not apply attribute damage, creature does not have \`${prop.stat}\` set`,
        silenced: prop.silent,
      }, damageTargetIds);
      return;
    }
  }
  await applyTask(action, {
    targetIds: damageTargetIds,
    subtaskFn: 'damageProp',
    params: {
      title: getPropertyTitle(prop),
      operation: prop.operation,
      value,
      targetProp: stat ?? { _id: 'dummyStat', name: prop.stat, type: 'attribute' },
    },
  }, userInput);
  return applyDefaultAfterPropTasks(action, prop, damageTargetIds, userInput);
}
