import { EngineAction } from '/imports/api/engine/action/EngineActions';
import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';
import { ResetTask } from '/imports/api/engine/action/tasks/Task';
import TaskResult from '/imports/api/engine/action/tasks/TaskResult';
import applyTask from '/imports/api/engine/action/tasks/applyTask';
import { getCreature, getPropertiesByFilter, getPropertiesOfType } from '/imports/api/engine/loadCreatures';
import getPropertyTitle from '/imports/api/utility/getPropertyTitle';

export default async function applyResetTask(
  task: ResetTask, action: EngineAction, result: TaskResult, userInput: InputProvider
): Promise<void> {
  // Event name must be defined
  if (!task.eventName) return;

  // This task can only be applied to a single target
  if (task.targetIds.length !== 1) {
    throw new Meteor.Error('wrong-number-of-targets', `Must reset the properties of a single creature at a time, ${task.targetIds.length} targets were provided`)
  }

  // Print a title for the event
  let name: string;
  switch (task.eventName) {
    case 'shortRest':
      name = 'Short Rest';
      break;
    case 'longRest':
      name = 'Long Rest';
      break;
    default:
      name = task.eventName;
      break;
  }
  result.appendLog({ name }, task.targetIds);

  // Reset the properties by this event name
  await resetProperties(task, action, result, userInput);

  // Reset hit dice on a long rest, starting with the highest dice
  if (task.eventName === 'longRest') {
    await resetHitDice(task, action, result, userInput);
  }
}

export async function resetProperties(task: ResetTask, action: EngineAction, result: TaskResult, userInput: InputProvider) {
  const creatureId = task.targetIds[0];

  // Long rests reset short rest properties as well
  let mongoFilter: Mongo.Selector<object>
  if (task.eventName === 'longRest') {
    mongoFilter = { reset: { $in: ['shortRest', 'longRest'] } }
  } else {
    mongoFilter = { reset: task.eventName };
  }

  const filterFn = (prop) => {
    if (task.eventName === 'longRest') {
      if (prop.reset !== 'longRest' && prop.reset !== 'shortRest') return false;
    } else {
      if (prop.reset !== task.eventName) return false;
    }
    return true;
  }

  // Attributes

  const attributeFilter: Mongo.Selector<object> = {
    ...mongoFilter,
    type: 'attribute',
    damage: { $nin: [0, undefined] },
  }

  const attributeFilterFunction = (att) => {
    if (att.type !== 'attribute') return false;
    if (!filterFn(att)) return false;
    if (att.damage === 0 || att.damage === undefined) return false;
    return true;
  }

  const attributes = getPropertiesByFilter(creatureId, attributeFilterFunction, attributeFilter);

  for (const prop of attributes) {
    await applyTask(action, {
      prop: task.prop || prop,
      targetIds: [action.creatureId],
      subtaskFn: 'damageProp',
      params: {
        title: getPropertyTitle(prop),
        operation: 'increment',
        value: -prop.damage ?? 0,
        targetProp: prop,
      },
    }, userInput);
  }

  // Action-like properties

  const actionFilter = {
    ...mongoFilter,
    type: {
      $in: ['action', 'spell']
    },
    usesUsed: { $nin: [0, undefined] },
  };

  const actionFilterFunction = (prop) => {
    if (prop.type !== 'action' && prop.type !== 'spell') return false;
    if (!filterFn(prop)) return false;
    if (prop.usesUsed === 0 || prop.usesUsed === undefined) return false;
    return true;
  }

  const actionProps = getPropertiesByFilter(creatureId, actionFilterFunction, actionFilter);

  for (const prop of actionProps) {
    result.mutations.push({
      targetIds: [creatureId],
      updates: [{
        propId: prop._id,
        type: prop.type,
        set: { usesUsed: 0 },
      }],
      contents: [{
        name: prop.name,
        value: prop.usesUsed >= 0 ? `Restored ${prop.usesUsed} uses` : `Removed ${-prop.usesUsed} uses`
      }],
    });
  }
}

async function resetHitDice(task: ResetTask, action: EngineAction, result: TaskResult, userInput: InputProvider) {
  const creatureId = task.targetIds[0];

  const hitDice = getPropertiesOfType(creatureId, 'hitDice');

  // Use a collator to do sorting in natural order
  const collator = new Intl.Collator('en', {
    numeric: true, sensitivity: 'base'
  });

  // Get the hit dice in decending order of hitDiceSize
  const compare = (a, b) => collator.compare(b.hitDiceSize, a.hitDiceSize)
  hitDice.sort(compare);

  // Get the total number of hit dice that can be recovered this rest
  const totalHd = hitDice.reduce((sum, hd) => sum + (hd.total || 0), 0);
  const creature = getCreature(creatureId);
  const resetMultiplier = creature.settings.hitDiceResetMultiplier || 0.5;
  let recoverableHd = Math.max(Math.floor(totalHd * resetMultiplier), 1);

  // recover each hit dice in turn until the recoverable amount is used up
  let amountToRecover;
  for (const hd of hitDice) {
    if (!recoverableHd) return;
    amountToRecover = Math.min(recoverableHd, hd.damage ?? 0);
    if (!amountToRecover) return;
    recoverableHd -= amountToRecover;

    // Apply the damage prop task
    await applyTask(action, {
      prop: task.prop || hd,
      targetIds: [creatureId],
      subtaskFn: 'damageProp',
      params: {
        title: getPropertyTitle(hd),
        operation: 'increment',
        value: -amountToRecover,
        targetProp: hd,
      },
    }, userInput);

  }
}
