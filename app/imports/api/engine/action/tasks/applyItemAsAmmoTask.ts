import type { EngineAction } from '/imports/api/engine/action/EngineActions';
import {
  applyDefaultAfterPropTasks, applyAfterTasksSkipChildren, applyTriggers
} from '/imports/api/engine/action/functions/applyTaskGroups';
import {
  getEffectiveActionScope
} from '/imports/api/engine/action/functions/getEffectiveActionScope';
import type { InputProvider } from '/imports/api/engine/action/functions/userInput/InputProvider';
import type { ApplyTask } from '/imports/api/engine/action/tasks/applyTask';
import type { ItemAsAmmoTask } from '/imports/api/engine/action/tasks/Task';
import TaskResult from '/imports/api/engine/action/tasks/TaskResult';
import { getPropertyChildren } from '/imports/api/engine/loadCreatures';
import { getNumberFromScope } from '/imports/api/engine/shared/scope';
import getPropertyTitle from '/imports/api/utility/getPropertyTitle';

export default async function applyItemAsAmmoTask(
  task: ItemAsAmmoTask,
  action: EngineAction,
  result: TaskResult,
  userInput: InputProvider,
  applyTask: ApplyTask,
): Promise<void> {
  const prop = task.prop;
  const { item } = task.params
  let { value } = task.params;

  if (item.type !== 'item') throw new Meteor.Error('wrong-ammo-property', 'Only items can be used as ammo');

  // Store the ammo item and value in the scope
  result.scope['#ammo'] = { _propId: item._id };
  result.pushScope = { ['~ammoConsumed']: { value } };

  // Apply the before triggers
  await applyTriggers(action, item, task.targetIds, 'ammoTriggerIds.before', userInput, applyTask);

  // Create a new result after before triggers have run
  result = new TaskResult(task.targetIds);
  action.results.push(result);

  // Refetch the scope properties
  const scope = await getEffectiveActionScope(action);
  result.popScope = {
    '~ammoConsumed': 1,
  };
  value = await getNumberFromScope('~ammoConsumed', scope) || 0;

  const itemChildren = task.params.skipChildren ? [] : await getPropertyChildren(action.creatureId, item);

  // Do the quantity adjustment
  // Check if property has quantity
  result.mutations.push({
    targetIds: task.targetIds,
    updates: [{
      propId: item._id,
      inc: { quantity: -value },
      type: 'item',
    }],
    // Log the item name as a heading if it has child properties to apply
    ...itemChildren.length && !task.params.skipChildren && {
      contents: [{
        name: getPropertyTitle(item) || 'Ammo',
        inline: false,
        ...'silent' in prop && prop?.silent && { silenced: true },
      }]
    },
  });

  await applyTriggers(action, item, task.targetIds, 'ammoTriggerIds.after', userInput, applyTask);

  if (task.params.skipChildren) {
    await applyAfterTasksSkipChildren(action, item, task.targetIds, userInput, applyTask);
  } else {
    await applyDefaultAfterPropTasks(action, item, task.targetIds, userInput, applyTask);
  }
  return applyTriggers(action, item, task.targetIds, 'ammoTriggerIds.afterChildren', userInput, applyTask);
}
