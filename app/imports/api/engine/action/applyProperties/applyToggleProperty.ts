import { EngineAction } from '/imports/api/engine/action/EngineActions';
import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';
import { applyAfterTasksSkipChildren, applyDefaultAfterPropTasks } from '/imports/api/engine/action/functions/applyTaskGroups';
import recalculateCalculation from '/imports/api/engine/action/functions/recalculateCalculation';
import { PropTask } from '/imports/api/engine/action/tasks/Task';
import TaskResult from '/imports/api/engine/action/tasks/TaskResult';

export default async function applyToggle(
  task: PropTask, action: EngineAction, result: TaskResult, inputProvider: InputProvider
): Promise<void> {

  const prop = task.prop;
  await recalculateCalculation(prop.condition, action, 'reduce', inputProvider);
  if (prop.condition?.value) {
    return applyDefaultAfterPropTasks(action, prop, task.targetIds, inputProvider);
  } else {
    return applyAfterTasksSkipChildren(action, prop, task.targetIds, inputProvider);
  }
}
