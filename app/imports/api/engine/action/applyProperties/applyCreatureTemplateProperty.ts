import { EngineAction } from '/imports/api/engine/action/EngineActions';
import { PropTask } from '/imports/api/engine/action/tasks/Task';
import recalculateInlineCalculations from '/imports/api/engine/action/functions/recalculateInlineCalculations';
import getPropertyTitle from '/imports/api/utility/getPropertyTitle';

export default async function applyCreatureTemplateProperty(
  task: PropTask, action: EngineAction, result, userInput
): Promise<void> {
  const prop = task.prop;
  //Log the Creature that is about to be summoned
  let logValue = prop.description?.value
  if (prop.description?.text) {
    await recalculateInlineCalculations(prop.description, action, 'reduce', userInput);
    logValue = prop.description?.value;
  }
  // There are no targets for creature templates
  // Creatures are always summoned as children of the action's creature
  result.appendLog({
    name: getPropertyTitle(prop),
    value: logValue,
    silenced: prop.silent,
  }, []);

  result.appendLog({
    name: 'Warning',
    value: 'Creature summoning is not yet implemented...',
    silenced: prop.silent,
  }, []);

  return;
}
