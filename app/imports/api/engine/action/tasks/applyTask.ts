import { EngineAction } from '/imports/api/engine/action/EngineActions';
import Task from './Task';
import TaskResult from '/imports/api/engine/action/tasks/TaskResult';
import applyDamagePropTask from '/imports/api/engine/action/tasks/applyDamagePropTask';
import applyItemAsAmmoTask from '/imports/api/engine/action/tasks/applyItemAsAmmoTask';
import { getSingleProperty } from '/imports/api/engine/loadCreatures';
import applyProperties from '/imports/api/engine/action/applyProperties';

export default async function applyTask(action: EngineAction, task: Task, userInput?): Promise<void> {
  action.taskCount += 1;
  if (action.taskCount > 100) throw 'Only 100 properties can be applied at once';

  if (task.subtaskFn) {
    const result = new TaskResult(task.prop._id, task.targetIds);
    action.results.push(result);
    switch (task.subtaskFn) {
      case 'damageProp':
        return applyDamagePropTask(task, action, result, userInput);
      case 'consumeItemAsAmmo':
        return applyItemAsAmmoTask(task, action, result, userInput);
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
        await applyTask(action, { prop: trigger, targetIds: task.targetIds }, userInput);
      }
    }

    // Create a result an push it to the action results, pass it to the apply function to modify
    const result = new TaskResult(task.prop._id, task.targetIds);
    result.scope[`#${prop.type}`] = prop;
    action.results.push(result);

    // Apply the property
    return applyProperties[prop.type]?.(task, action, result, userInput);
  }
}