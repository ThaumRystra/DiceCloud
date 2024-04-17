import { applyDefaultAfterPropTasks } from '/imports/api/engine/action/functions/applyTaskGroups';
import { CheckTask } from '/imports/api/engine/action/tasks/Task';
import { EngineAction } from '/imports/api/engine/action/EngineActions';
import { getEffectiveActionScope } from '/imports/api/engine/action/functions/getEffectiveActionScope';
import { getFromScope } from '/imports/api/creature/creatures/CreatureVariables';
import { getVariables } from '/imports/api/engine/loadCreatures';
import InputProvider, { CheckParams } from '/imports/api/engine/action/functions/userInput/InputProvider';
import numberToSignedString from '/imports/api/utility/numberToSignedString';
import TaskResult from '/imports/api/engine/action/tasks/TaskResult';

/**
 * A skill property is applied as a check or a saving throw
 */
export default async function applyCheckTask(
  task: CheckTask, action: EngineAction, result: TaskResult, userInput: InputProvider
): Promise<void> {
  const prop = task.prop;
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

    const totalModifier = skillBonus + abilityModifier;
    const rollModifierText = numberToSignedString(totalModifier);

    // Get the name of the check
    let checkName = 'Check';
    if (ability?.name && skill?.name) {
      checkName = `${ability.name} (${skill.name})`
    } else if (ability?.name || skill?.name) {
      checkName = `${ability?.name || skill?.name}`;
    }

    let rollName = 'Roll'

    // Append advantage/disadvantage to the check name
    if (advantage === 1) {
      rollName += ' (Advantage)'
    } else if (advantage === -1) {
      rollName += ' (Disadvantage)'
    }

    // Print check name and DC if present
    const dc = checkParams.dc;
    result.appendLog({
      name: checkName,
      inline: true,
      ...dc !== null && { value: `DC **${dc}**` },
      ...prop?.silent && { silenced: prop.silent }
    }, [targetId]);

    // Roll the dice
    let rolledValue, resultPrefix;
    if (advantage === 1) {
      const [[a, b]] = await userInput.rollDice([{ number: 2, diceSize: 20 }]);
      if (a >= b) {
        rolledValue = a;
        resultPrefix = `1d20 [ ${a}, ~~${b}~~ ] ${rollModifierText}`;
      } else {
        rolledValue = b;
        resultPrefix = `1d20 [ ~~${a}~~, ${b} ] ${rollModifierText}`;
      }
    } else if (advantage === -1) {
      const [[a, b]] = await userInput.rollDice([{ number: 2, diceSize: 20 }]);
      if (a <= b) {
        rolledValue = a;
        resultPrefix = `1d20 [ ${a}, ~~${b}~~ ] ${rollModifierText}`;
      } else {
        rolledValue = b;
        resultPrefix = `1d20 [ ~~${a}~~, ${b} ] ${rollModifierText}`;
      }
    } else {
      [[rolledValue]] = await userInput.rollDice([{ number: 1, diceSize: 20 }]);
      resultPrefix = `1d20 [${rolledValue}] ${rollModifierText}`
    }

    const totalValue = rolledValue + totalModifier;

    result.appendLog({
      name: rollName,
      value: `${resultPrefix}\n**${totalValue}**`,
      inline: true,
      ...prop?.silent && { silenced: prop.silent }
    }, [targetId]);
  }

  return applyDefaultAfterPropTasks(action, prop, targetIds, userInput);
}

// TODO set these and potentially read them again if triggers can change them
/*
'~checkAdvantage'
'~checkAdvantage'
'~checkDiceRoll'
'~checkRoll'
'~checkModifier'
*/
