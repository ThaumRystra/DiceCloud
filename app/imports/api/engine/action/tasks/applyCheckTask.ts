import { applyTriggers } from '/imports/api/engine/action/functions/applyTaskGroups';
import { CheckTask } from '/imports/api/engine/action/tasks/Task';
import { EngineAction } from '/imports/api/engine/action/EngineActions';
import { getEffectiveActionScope } from '/imports/api/engine/action/functions/getEffectiveActionScope';
import { getFromScope } from '/imports/api/creature/creatures/CreatureVariables';
import { getVariables } from '/imports/api/engine/loadCreatures';
import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';
import TaskResult from '/imports/api/engine/action/tasks/TaskResult';
import rollCoreDice, { advantageSuffix, clampAdvantage, writeCoreDiceScope } from '/imports/api/engine/action/functions/rollCoreDice';

/**
 * A skill property is applied as a check or a saving throw
 */
export default async function applyCheckTask(
  task: CheckTask, action: EngineAction, result: TaskResult, userInput: InputProvider
): Promise<void> {
  const targetIds = task.targetIds;

  if (task.contest) {
    throw new Meteor.Error('not-implemented', 'This functionality is not implemented yet');
  }

  for (const targetId of targetIds) {
    let scope;
    if (targetId === action.creatureId) {
      scope = await getEffectiveActionScope(action);
    } else {
      scope = getVariables(targetId);
    }
    // Get the updated parameters from user input
    const checkParams = await userInput.check(task);
    const advantage = checkParams.advantage;

    const skill = checkParams.skillVariableName && getFromScope(checkParams.skillVariableName, scope) || null;
    const skillBonus = (skill?.value || 0) - (skill?.abilityMod || 0);

    const ability = checkParams.abilityVariableName && getFromScope(checkParams.abilityVariableName, scope) || null;
    const abilityModifier = ability?.modifier || 0;


    // Run the before triggers which may change scope properties
    if (skill) await applyTriggers(action, skill, [targetId], 'checkTriggerIds.before', userInput);
    if (ability) await applyTriggers(action, ability, [targetId], 'checkTriggerIds.before', userInput);

    if (skill || ability) {
      // Create a new result after before triggers have run
      result = new TaskResult(task.targetIds);
      action.results.push(result);
    }

    const totalModifier = skillBonus + abilityModifier;

    // Get the name of the check
    let checkName = 'Check';
    if (ability?.name && skill?.name) {
      checkName = `${ability.name} (${skill.name})`
    } else if (ability?.name || skill?.name) {
      checkName = `${ability?.name || skill?.name}`;
    }

    let rollName = 'Roll'

    // Append advantage/disadvantage to the check name
    rollName += advantageSuffix(clampAdvantage(advantage));

    // Print check name and DC if present
    const dc = checkParams.dc;
    result.appendLog({
      name: checkName,
      inline: true,
      ...dc !== null && { value: `DC **${dc}**` },
      silenced: task.silent ?? false,
    }, [targetId]);

    // Roll the dice
    const roll = await rollCoreDice(userInput, advantage, totalModifier);
    const resultPrefix = roll.logText;
    const totalValue = roll.total;

    // Expose the check result to triggers and branches
    result.pushScope = {};
    writeCoreDiceScope(result.pushScope, '~check', roll);
    result.pushScope['~checkRoll'] = { value: totalValue };

    result.appendLog({
      name: rollName,
      value: `${resultPrefix}\n**${totalValue}**`,
      inline: true,
      silenced: task.silent ?? false,
    }, [targetId]);

    // After check triggers
    if (skill) await applyTriggers(action, skill, [targetId], 'checkTriggerIds.after', userInput);
    if (ability) await applyTriggers(action, ability, [targetId], 'checkTriggerIds.after', userInput);

    // After children check triggers
    if (skill) await applyTriggers(action, skill, [targetId], 'checkTriggerIds.afterChildren', userInput);
    if (ability) await applyTriggers(action, ability, [targetId], 'checkTriggerIds.afterChildren', userInput);
  }
}
