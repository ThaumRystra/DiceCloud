import { filter } from 'lodash';
import { EngineAction } from '/imports/api/engine/action/EngineActions';
import InputProvider from '/imports/api/engine/action/functions/InputProvider';
import { applyAfterPropTasksForSingleChild, applyAfterPropTasksForSomeChildren, applyAfterTasksSkipChildren, applyDefaultAfterPropTasks, applyTaskToEachTarget } from '/imports/api/engine/action/functions/applyTaskGroups';
import { getEffectiveActionScope } from '/imports/api/engine/action/functions/getEffectiveActionScope';
import recalculateCalculation from '/imports/api/engine/action/functions/recalculateCalculation';
import { PropTask } from '/imports/api/engine/action/tasks/Task';
import TaskResult from '/imports/api/engine/action/tasks/TaskResult';
import { getPropertyChildren } from '/imports/api/engine/loadCreatures';
import rollDice from '/imports/parser/rollDice';

export default async function applyBranchProperty(
  task: PropTask, action: EngineAction, result: TaskResult, userInput: InputProvider
): Promise<void> {
  const prop = task.prop;
  const targets = task.targetIds;

  switch (prop.branchType) {
    case 'if': {
      await recalculateCalculation(prop.condition, action, 'reduce', userInput);
      if (prop.condition?.value) {
        return applyDefaultAfterPropTasks(action, prop, targets, userInput);
      } else {
        return applyAfterTasksSkipChildren(action, prop, targets, userInput);
      }
    }
    case 'index': {
      const children = await getPropertyChildren(action.creatureId, prop);
      if (!children.length) {
        return applyAfterTasksSkipChildren(action, prop, targets, userInput);
      }
      await recalculateCalculation(prop.condition, action, 'reduce', userInput);
      if (!isFinite(prop.condition?.value)) {
        result.appendLog({
          name: 'Branch Error',
          value: 'Index did not resolve into a valid number'
        }, targets);
        return applyAfterTasksSkipChildren(action, prop, targets, userInput);
      }
      let index = Math.floor(prop.condition?.value);
      if (index < 1) index = 1;
      if (index > children.length) index = children.length;
      const child = children[index - 1];
      return applyAfterPropTasksForSingleChild(action, prop, child, targets, userInput);
    }
    case 'hit': {
      const scope = await getEffectiveActionScope(action);
      if (scope['~attackHit']?.value) {
        if (!targets.length && !prop.silent) {
          result.appendLog({
            value: '**On hit**'
          }, targets);
        }
        return applyDefaultAfterPropTasks(action, prop, targets, userInput);
      } else {
        return applyAfterTasksSkipChildren(action, prop, targets, userInput);
      }
    }
    case 'miss': {
      const scope = await getEffectiveActionScope(action);
      if (scope['~attackMiss']?.value) {
        if (!targets.length && !prop.silent) {
          result.appendLog({
            value: '**On miss**'
          }, targets);
        }
        return applyDefaultAfterPropTasks(action, prop, targets, userInput);
      } else {
        return applyAfterTasksSkipChildren(action, prop, targets, userInput);
      }
    }
    case 'failedSave': {
      const scope = await getEffectiveActionScope(action);
      if (scope['~saveFailed']?.value) {
        if (!targets.length && !prop.silent) {
          result.appendLog({
            value: '**On failed save**'
          }, targets);
        }
        return applyDefaultAfterPropTasks(action, prop, targets, userInput);
      } else {
        return applyAfterTasksSkipChildren(action, prop, targets, userInput);
      }
    }
    case 'successfulSave': {
      const scope = await getEffectiveActionScope(action);
      if (scope['~saveSucceeded']?.value) {
        if (!targets.length && !prop.silent) {
          result.appendLog({
            value: '**On save**'
          }, targets);
        }
        return applyDefaultAfterPropTasks(action, prop, targets, userInput);
      } else {
        return applyAfterTasksSkipChildren(action, prop, targets, userInput);
      }
    }
    case 'random': {
      const children = await getPropertyChildren(action.creatureId, prop);
      if (children.length) {
        const index = rollDice(1, children.length)[0];
        const child = children[index - 1];
        return applyAfterPropTasksForSingleChild(action, prop, child, targets, userInput);
      } else {
        return applyAfterTasksSkipChildren(action, prop, targets, userInput);
      }
    }
    case 'eachTarget':
      if (targets.length > 1) {
        return applyTaskToEachTarget(action, task, targets, userInput);
      }
      return applyDefaultAfterPropTasks(action, prop, targets, userInput);
    case 'choice': {
      const children = await getPropertyChildren(action.creatureId, prop);
      let choices: string[];
      let chosenChildren: typeof children = [];
      if (children.length) {
        choices = await userInput.choose(children);
        chosenChildren = filter(children, child => choices.includes(child._id));
      }
      if (!children.length || !chosenChildren.length) {
        return applyAfterTasksSkipChildren(action, prop, targets, userInput);
      }
      return applyAfterPropTasksForSomeChildren(action, prop, chosenChildren, targets, userInput);
    }
  }
}