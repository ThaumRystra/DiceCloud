import rollDice from '/imports/parser/rollDice.js';
import recalculateCalculation from './shared/recalculateCalculation.js';
import applyProperty from '../applyProperty.js';
import numberToSignedString from '/imports/api/utility/numberToSignedString.js';
import applyChildren from '/imports/api/engine/actions/applyPropertyByType/shared/applyChildren.js';
import { applyNodeTriggers } from '/imports/api/engine/actions/applyTriggers.js';
import { applyUnresolvedEffects } from '/imports/api/engine/actions/doCheck.js';

export default function applySavingThrow(node, actionContext) {
  applyNodeTriggers(node, 'before', actionContext);
  const prop = node.node;
  const originalTargets = actionContext.targets;

  let saveTargets = prop.target === 'self' ? [actionContext.creature] : actionContext.targets;

  recalculateCalculation(prop.dc, actionContext);

  const dc = (prop.dc?.value);
  if (!isFinite(dc)) {
    actionContext.addLog({
      name: 'Error',
      value: 'Saving throw requires a DC',
    });
    return node.children.forEach(child => applyProperty(child, actionContext));
  }
  if (!prop.silent) actionContext.addLog({
    name: prop.name,
    value: `DC **${dc}**`,
    inline: true,
  });
  const scope = actionContext.scope;

  // If there are no save targets, apply all children as if the save both
  // succeeeded and failed
  if (!saveTargets?.length) {
    scope['~saveFailed'] = { value: true };
    scope['~saveSucceeded'] = { value: true };
    return applyChildren(node, actionContext);
  }

  // Each target makes the saving throw
  saveTargets.forEach(target => {
    delete scope['~saveFailed'];
    delete scope['~saveSucceeded'];
    delete scope['~saveDiceRoll'];
    delete scope['~saveRoll'];

    const applyChildrenToTarget = function () {
      actionContext.targets = [target];
      return applyChildren(node, actionContext);
    };

    const save = target.variables[prop.stat];

    if (!save) {
      actionContext.addLog({
        name: 'Saving throw error',
        value: 'No saving throw found: ' + prop.stat,
      });
      return applyChildrenToTarget();
    }

    let rollModifierText = numberToSignedString(save.value, true);
    let rollModifier = save.value
    const { effectBonus, effectString } = applyUnresolvedEffects(save, scope)
    rollModifierText += effectString;
    rollModifier += effectBonus;

    let value, values, resultPrefix;
    if (save.advantage === 1) {
      const [a, b] = rollDice(2, 20);
      if (a >= b) {
        value = a;
        resultPrefix = `Advantage\n1d20 [ ${a}, ~~${b}~~ ] ${rollModifierText}`;
      } else {
        value = b;
        resultPrefix = `Advantage\n1d20 [ ~~${a}~~, ${b} ] ${rollModifierText}`;
      }
    } else if (save.advantage === -1) {
      const [a, b] = rollDice(2, 20);
      if (a <= b) {
        value = a;
        resultPrefix = `Disadvantage\n1d20 [ ${a}, ~~${b}~~ ] ${rollModifierText}`;
      } else {
        value = b;
        resultPrefix = `Disadvantage\n1d20 [ ~~${a}~~, ${b} ] ${rollModifierText}`;
      }
    } else {
      values = rollDice(1, 20);
      value = values[0];
      resultPrefix = `1d20 [ ${value} ] ${rollModifierText}`
    }
    scope['~saveDiceRoll'] = { value };
    const result = value + rollModifier || 0;
    scope['~saveRoll'] = { value: result };
    const saveSuccess = result >= dc;
    if (saveSuccess) {
      scope['~saveSucceeded'] = { value: true };
    } else {
      scope['~saveFailed'] = { value: true };
    }
    if (!prop.silent) actionContext.addLog({
      name: saveSuccess ? 'Successful save' : 'Failed save',
      value: resultPrefix + '\n**' + result + '**',
      inline: true,
    });
    return applyChildrenToTarget();
  });
  // reset the targets after the save to each child
  actionContext.targets = originalTargets;
}
