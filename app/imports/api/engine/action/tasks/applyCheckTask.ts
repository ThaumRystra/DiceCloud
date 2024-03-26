import { getFromScope } from '/imports/api/creature/creatures/CreatureVariables';
import { EngineAction } from '/imports/api/engine/action/EngineActions';
import InputProvider, { CheckParams } from '/imports/api/engine/action/functions/InputProvider';
import { applyDefaultAfterPropTasks } from '/imports/api/engine/action/functions/applyTaskGroups';
import { getEffectiveActionScope } from '/imports/api/engine/action/functions/getEffectiveActionScope';
import recalculateCalculation from '/imports/api/engine/action/functions/recalculateCalculation';
import { applyUnresolvedEffects } from '/imports/api/engine/action/methods/doCheck';
import { PropTask } from '/imports/api/engine/action/tasks/Task';
import TaskResult from '/imports/api/engine/action/tasks/TaskResult';
import { getVariables } from '/imports/api/engine/loadCreatures';
import numberToSignedString from '/imports/api/utility/numberToSignedString';
import { isFiniteNode } from '/imports/parser/parseTree/constant';

// TODO implement this 
/**
 * A skill property is applied as a check or a saving throw
 */
export default async function applyCheckTask(
  task: PropTask, action: EngineAction, result: TaskResult, inputProvider: InputProvider
): Promise<void> {

  throw new Meteor.Error('Not implemented', 'This function needs to be implemented');

  const prop = task.prop;
  const targetIds = task.targetIds;
  if (targetIds?.length) {
    throw new Meteor.Error('too-many-targets',
      'This function is only implemented for zero targets');
  }

  let checkParams: CheckParams = {
    advantage: 0,
    skillVariableName: prop.variableName,
    abilityVariableName: prop.ability,
    dc: null,
  }

  checkParams = await inputProvider.check(checkParams);

  const dc = checkParams.dc;
  if (!prop.silent && dc !== null) result.appendLog({
    name: prop.name,
    value: `DC **${dc}**`,
    inline: true,
    ...prop.silent && { silenced: prop.silent }
  }, targetIds);
  const scope = await getEffectiveActionScope(action);

  return applyDefaultAfterPropTasks(action, prop, targetIds, inputProvider);
}
