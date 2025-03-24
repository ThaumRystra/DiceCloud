import { EngineAction } from '/imports/api/engine/action/EngineActions';
import { CastSpellTask } from '/imports/api/engine/action/tasks/Task';
import TaskResult from './TaskResult';
import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';
import { getSingleProperty } from '/imports/api/engine/loadCreatures';
import applyTask from '/imports/api/engine/action/tasks/applyTask';
import applyActionProperty from '../applyProperties/applyActionProperty';

export default async function applySpellProperty(
  task: CastSpellTask, action: EngineAction, result: TaskResult, userInput: InputProvider
): Promise<void> {
  const prop = task.prop;
  const targetIds = prop.target === 'self' ? [action.creatureId] : task.targetIds;

  if (!prop) {
    result.appendLog({
      name: 'Error casting spell',
      value: 'The chosen spell was not found',
      silenced: false,
    }, [action.creatureId]);
    return;
  }
  let slotLevel = prop.level || 0;
  let message = '';

  if (task.params.withoutSpellSlot) {
    message = `Casting at level ${slotLevel}`
  } else if (task.params.ritual) {
    message = `Ritual casting at level ${slotLevel}`
  } else {
    // Get the slot being cast with
    const spellSlot = task.params.slotId && getSingleProperty(action.creatureId, task.params.slotId) || undefined;
    // Ensure the slot exists
    if (!spellSlot) {
      result.appendLog({
        name: 'Error casting spell',
        value: 'The chosen spell requires a spell slot to cast',
        silenced: false,
      }, [action.creatureId]);
      return;
    }
    // And is the right type
    if (spellSlot.type !== 'attribute' || spellSlot.attributeType !== 'spellSlot') {
      result.appendLog({
        name: 'Error casting spell',
        value: 'The chosen slot was not actually a spell slot',
        silenced: false,
      }, [action.creatureId]);
      return;
    }
    // Spend the slot
    await applyTask(action, {
      targetIds: [action.creatureId],
      subtaskFn: 'damageProp',
      params: {
        operation: 'increment',
        value: 1,
        targetProp: spellSlot,
      },
    }, userInput);
    slotLevel = spellSlot ? Number(spellSlot.spellSlotLevel?.value) || 0 : slotLevel;
    message = `Casting using a level ${slotLevel} spell slot`;
  }

  // Log casting method
  result.appendLog({
    name: message,
    silenced: prop.silent,
  }, targetIds);

  // Add the slot level to the scope
  result.pushScope = {
    '~slotLevel': { value: slotLevel },
    'slotLevel': { value: slotLevel },
  };

  // Run the rest of the spell as if it were an action
  return applyActionProperty({
    prop,
    targetIds: targetIds,
  }, action, result, userInput);
}
