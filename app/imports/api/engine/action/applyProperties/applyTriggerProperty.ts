import { EngineAction } from '/imports/api/engine/action/EngineActions';
import { applyDefaultAfterPropTasks } from '/imports/api/engine/action/functions/applyTaskGroups';
import recalculateInlineCalculations from '/imports/api/engine/action/functions/recalculateInlineCalculations';
import { PropTask } from '/imports/api/engine/action/tasks/Task';
import getPropertyTitle from '/imports/api/utility/getPropertyTitle';

export default async function applyTriggerProperty(
  task: PropTask, action: EngineAction, result, userInput
): Promise<void> {
  const prop = task.prop;
  const logContent = {
    name: getPropertyTitle(prop),
    ...prop.silent && { silenced: true },
  }

  // Add the trigger description to the log
  if (prop.description?.text) {
    await recalculateInlineCalculations(prop.description, action, 'reduce', userInput);
    if (prop.description.value) {
      logContent.value = prop.description.value;
    }
  }

  result.appendLog(logContent);
  return applyDefaultAfterPropTasks(action, prop, task.targetIds, userInput);
}
