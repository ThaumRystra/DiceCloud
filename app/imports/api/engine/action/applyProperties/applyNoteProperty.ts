import { EngineAction } from '/imports/api/engine/action/EngineActions';
import type { InputProvider } from '/imports/api/engine/action/functions/userInput/InputProvider';
import { applyDefaultAfterPropTasks } from '/imports/api/engine/action/functions/applyTaskGroups';
import recalculateInlineCalculations from '/imports/api/engine/action/functions/recalculateInlineCalculations';
import { PropTask } from '/imports/api/engine/action/tasks/Task';
import TaskResult, { LogContent } from '/imports/api/engine/action/tasks/TaskResult';

export default async function applyNoteProperty(
  task: PropTask, action: EngineAction, result: TaskResult, inputProvider: InputProvider
): Promise<void> {
  const prop = task.prop;

  if (prop.type !== 'note') {
    throw new Meteor.Error('wrong-property', `Expected a note, got ${prop.type} instead`);
  }

  const logContent: LogContent & { silenced: boolean | undefined; } = {
    silenced: prop.silent,
  };
  if (prop.name) logContent.name = prop.name;
  if (prop.summary?.text) {
    await recalculateInlineCalculations(prop.summary, action, 'reduce', inputProvider);
    logContent.value = prop.summary.value;
  }

  if (logContent.name || logContent.value) {
    result.appendLog(logContent, task.targetIds);
  }
  // Log description
  if (prop.description?.text) {
    await recalculateInlineCalculations(prop.description, action, 'reduce', inputProvider);
    result.appendLog({
      value: prop.description.value,
      silenced: prop.silent,
    }, task.targetIds);
  }
  return applyDefaultAfterPropTasks(action, prop, task.targetIds, inputProvider);
}
