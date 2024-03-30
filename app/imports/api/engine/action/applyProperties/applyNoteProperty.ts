import { EngineAction } from '/imports/api/engine/action/EngineActions';
import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';
import { applyDefaultAfterPropTasks } from '/imports/api/engine/action/functions/applyTaskGroups';
import recalculateInlineCalculations from '/imports/api/engine/action/functions/recalculateInlineCalculations';
import { PropTask } from '/imports/api/engine/action/tasks/Task';
import TaskResult, { LogContent } from '/imports/api/engine/action/tasks/TaskResult';

export default async function applyNoteProperty(
  task: PropTask, action: EngineAction, result: TaskResult, inputProvider: InputProvider
): Promise<void> {
  const prop = task.prop;
  let contents: LogContent[] | undefined = undefined;
  const logContent: LogContent = {};
  if (prop.name) logContent.name = prop.name;
  if (prop.summary?.text) {
    await recalculateInlineCalculations(prop.summary, action, 'reduce', inputProvider);
    logContent.value = prop.summary.value;
  }

  if (logContent.name || logContent.value) {
    contents = [logContent];
  }
  // Log description
  if (prop.description?.text) {
    await recalculateInlineCalculations(prop.description, action, 'reduce', inputProvider);
    if (!contents) contents = [];
    contents.push({ value: prop.description.value });
  }
  if (contents) {
    result.mutations.push({
      contents,
      targetIds: task.targetIds,
    });
  }
  return applyDefaultAfterPropTasks(action, prop, task.targetIds, inputProvider);
}