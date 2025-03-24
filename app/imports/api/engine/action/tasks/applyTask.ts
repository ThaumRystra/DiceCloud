import { EngineAction } from '/imports/api/engine/action/EngineActions';
import Task, { CheckTask, DamagePropTask, ItemAsAmmoTask, PropTask } from './Task';
import TaskResult from '/imports/api/engine/action/tasks/TaskResult';
import applyDamagePropTask from '/imports/api/engine/action/tasks/applyDamagePropTask';
import applyItemAsAmmoTask from '/imports/api/engine/action/tasks/applyItemAsAmmoTask';
import { getSingleProperty } from '/imports/api/engine/loadCreatures';
import applyProperties from '/imports/api/engine/action/applyProperties';
import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';
import applyCheckTask from '/imports/api/engine/action/tasks/applyCheckTask';
import applyResetTask from '/imports/api/engine/action/tasks/applyResetTask';
import applyCastSpellTask from '/imports/api/engine/action/tasks/applyCastSpellTask';
import { getPropertyName } from '/imports/constants/PROPERTIES';

// DamagePropTask promises a number of actual damage done
export default async function applyTask(
  action: EngineAction, task: DamagePropTask, inputProvider: InputProvider
): Promise<number>

// Other tasks promise nothing
export default async function applyTask(
  action: EngineAction, task: PropTask | ItemAsAmmoTask | CheckTask, inputProvider: InputProvider
): Promise<void>

export default async function applyTask(
  action: EngineAction, task: Task, inputProvider: InputProvider
): Promise<void | number>

export default async function applyTask(
  action: EngineAction, task: Task, inputProvider: InputProvider
): Promise<void | number> {

  // Pause and wait for the user if the action is being stepped through
  if (action._isSimulation && action._stepThrough && inputProvider.nextStep) {
    await inputProvider.nextStep(task);
  }

  // Ensure no more than 100 tasks are performed by a single action
  action.taskCount += 1;
  if (action.taskCount > 100) throw 'Only 100 properties can be applied at once';

  if (task.subtaskFn) {
    const result = new TaskResult(task.targetIds);
    action.results.push(result);
    switch (task.subtaskFn) {
      case 'damageProp':
        return applyDamagePropTask(task, action, result, inputProvider);
      case 'consumeItemAsAmmo':
        return applyItemAsAmmoTask(task, action, result, inputProvider);
      case 'check':
        return applyCheckTask(task, action, result, inputProvider);
      case 'reset':
        return applyResetTask(task, action, result, inputProvider);
      case 'castSpell':
        return applyCastSpellTask(task, action, result, inputProvider);
      default:
        throw 'No case defined for the given subtaskFn';
    }
  } else {
    // Get property
    const prop = task.prop;

    // Ensure the prop exists
    if (!prop) throw new Meteor.Error('Not found', 'Property could not be found');

    // If the property is deactivated by a toggle, skip it
    if (prop.deactivatedByToggle) return;

    // Before triggers
    if (prop.triggerIds?.before?.length) {
      for (const triggerId of prop.triggerIds.before) {
        const trigger = await getSingleProperty(action.creatureId, triggerId);
        if (!trigger) continue;
        await applyTask(action, { prop: trigger, targetIds: task.targetIds }, inputProvider);
      }
    }

    // Create a result an push it to the action results, pass it to the apply function to modify
    const result = new TaskResult(task.targetIds);
    result.scope[`#${prop.type}`] = { _propId: prop._id };
    action.results.push(result);

    // Apply the property
    if (!applyProperties[prop.type]) {
      result.appendLog({
        name: 'Warning',
        value: `Could not apply ${getPropertyName(prop.type)}, only certain properties can be run as part of an action`,
        silenced: false,
      }, task.targetIds);
      return;
    }
    return applyProperties[prop.type](task, action, result, inputProvider);
  }
}
