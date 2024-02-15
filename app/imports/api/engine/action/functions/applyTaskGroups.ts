import { get } from 'lodash';

import { getPropertyChildren, getSingleProperty } from '/imports/api/engine/loadCreatures';
import { EngineAction } from '/imports/api/engine/action/EngineActions';
import applyTask from '../tasks/applyTask';
import { PropTask } from '../tasks/Task';

/**
 * Get all the child tasks of a given property
 * @param action
 * @param prop 
 * @param targetIds 
 * @returns 
 */
export async function applyChildren(
  action: EngineAction, prop, targetIds: string[], userInput
) {
  const children = await getPropertyChildren(action.creatureId, prop);
  // Push the child tasks and related triggers to the stack
  for (const childProp of children) {
    await applyTask(action, { prop: childProp, targetIds }, userInput);
  }
}

/**
 * Get the afterChildren triggers for a given property
 * @param prop 
 * @param targetIds 
 * @returns 
 */
export async function applyAfterChildrenTriggers(
  action: EngineAction, prop, targetIds: string[], userInput
) {
  if (!prop.triggerIds?.afterChildren) return;
  for (const triggerId of prop.triggerIds.afterChildren) {
    const trigger = await getSingleProperty(action.creatureId, triggerId);
    if (!trigger) continue;
    await applyTask(action, { prop: trigger, targetIds }, userInput);
  }
}

export async function applyAfterTriggers(
  action: EngineAction, prop, targetIds: string[], userInput
) {
  if (!prop.triggerIds?.after) return;
  for (const triggerId of prop.triggerIds.after) {
    const trigger = await getSingleProperty(action.creatureId, triggerId);
    if (!trigger) continue;
    await applyTask(action, { prop: trigger, targetIds }, userInput);
  }
}

/**
 * Applies the following:
 * After triggers
 * Children of the prop
 * After-children triggers
 * @param action 
 * @param prop 
 * @param targetIds 
 * @returns 
 */
export async function applyDefaultAfterPropTasks(
  action: EngineAction, prop, targetIds: string[], userInput
) {
  await applyAfterTriggers(action, prop, targetIds, userInput);
  await applyChildren(action, prop, targetIds, userInput);
  await applyAfterChildrenTriggers(action, prop, targetIds, userInput);
}

/**
 * Applies the following:
 * After triggers
 * After-children triggers
 * @param action 
 * @param prop 
 * @param targetIds 
 * @returns 
 */
export async function applyAfterTasksSkipChildren(
  action: EngineAction, prop, targetIds: string[], userInput
) {
  await applyAfterTriggers(action, prop, targetIds, userInput);
  await applyAfterChildrenTriggers(action, prop, targetIds, userInput);
}

/**
 * Returns a list of tasks containing the following:
 * After triggers
 * After-children triggers
 * @param action 
 * @param prop 
 * @param targetIds 
 * @returns 
 */
export async function applyAfterPropTasksForSingleChild(
  action: EngineAction, prop, childProp, targetIds: string[], userInput
) {
  await applyAfterTriggers(action, prop, targetIds, userInput);
  await applyTask(action, { prop: childProp, targetIds }, userInput);
  await applyAfterChildrenTriggers(action, prop, targetIds, userInput);
}

/**
 * Get all the trigger tasks for a given trigger path
 * @param action 
 * @param prop 
 * @param targetIds 
 * @param triggerPath 
 * @returns 
 */
export async function applyTriggers(
  action: EngineAction, prop, targetIds: string[], triggerPath: string, userInput
) {
  const triggerIds = get(prop?.triggers, triggerPath);
  if (!triggerIds) return;
  for (const triggerId of triggerIds) {
    const trigger = await getSingleProperty(action.creatureId, triggerId);
    if (!trigger) continue;
    await applyTask(action, { prop: trigger, targetIds }, userInput);
  }
}

/**
 * Split a task over its targets, incrementing task step by 1
 * @param task 
 * @param targetIds 
 * @returns Copies of the task, but with a single target each
 */
export async function applyTaskToEachTarget(
  action: EngineAction, task: PropTask, targetIds: string[] = task.targetIds, userInput
) {
  if (targetIds.length <= 1) throw 'Must have multiple targets to split a task';
  // If there are targets, apply a new task to each target
  for (const targetId of targetIds) {
    await applyTask(action, {
      ...task,
      targetIds: [targetId]
    }, userInput);
  }
}
