import { EngineAction } from '/imports/api/engine/action/EngineActions';
import { applyDefaultAfterPropTasks } from '/imports/api/engine/action/functions/applyTaskGroups';
import { PropTask } from '/imports/api/engine/action/tasks/Task';
import getPropertyTitle from '/imports/api/utility/getPropertyTitle';


export default async function applyTriggerProperty(
  task: PropTask, action: EngineAction, result, userInput
): Promise<void> {
  const prop = task.prop;
  result.appendLog({
    name: getPropertyTitle(prop),
    ...prop.silent && { silenced: true },
  })
  return applyDefaultAfterPropTasks(action, prop, task.targetIds, userInput);
}
