import { EngineAction } from '/imports/api/engine/action/EngineActions';
import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';
import { applyDefaultAfterPropTasks } from '/imports/api/engine/action/functions/applyTaskGroups';
import { rollAndReduceCalculation } from '/imports/api/engine/action/functions/recalculateCalculation';
import { PropTask } from '/imports/api/engine/action/tasks/Task';
import TaskResult from '/imports/api/engine/action/tasks/TaskResult';
import { isFiniteNode } from '/imports/parser/parseTree/constant';
import toString from '/imports/parser/toString';

export default async function applyRollProperty(
  task: PropTask, action: EngineAction, result: TaskResult, inputProvider: InputProvider
): Promise<void> {
  const prop = task.prop;
  // If there isn't a calculation, just apply the children instead
  if (!prop.roll?.calculation) {
    return applyDefaultAfterPropTasks(action, prop, task.targetIds, inputProvider);
  }

  const logValue: string[] = [];

  // roll the dice only and store that string
  const {
    rolled, reduced, errors
  } = await rollAndReduceCalculation(prop.roll, action, inputProvider);

  if (rolled.parseType !== 'constant') {
    logValue.push(toString(rolled));
  }
  errors?.forEach(error => {
    result.appendLog({
      name: 'Error',
      value: error.message,
      silenced: prop.silent,
    }, task.targetIds);
  });

  // Store the result
  if (reduced.parseType === 'constant') {
    prop.roll.value = reduced.value;
  } else if (reduced.parseType === 'error') {
    prop.roll.value = null;
  } else {
    prop.roll.value = toString(reduced);
  }

  // If we didn't end up with a constant or a number of finite value, give up
  if (!isFiniteNode(reduced)) {
    return applyDefaultAfterPropTasks(action, prop, task.targetIds, inputProvider);
  }
  const value = reduced.value;

  result.scope[prop.variableName] = { value };
  logValue.push(`**${value}**`);

  result.appendLog({
    name: prop.name,
    value: logValue.join('\n'),
    inline: true,
    silenced: prop.silent,
  }, task.targetIds);

  // Apply children
  return applyDefaultAfterPropTasks(action, prop, task.targetIds, inputProvider);
}
