import { EngineAction } from '/imports/api/engine/action/EngineActions';
import { applyDefaultAfterPropTasks } from '/imports/api/engine/action/functions/applyTaskGroups';
import { PropTask } from '/imports/api/engine/action/tasks/Task';


export default async function applyFolderProperty(
  task: PropTask, action: EngineAction, result, userInput
): Promise<void> {
  const prop = task.prop;
  return applyDefaultAfterPropTasks(action, prop, task.targetIds, userInput);
}
