import rollDice from '/imports/parser/rollDice.js';
import recalculateCalculation from './shared/recalculateCalculation.js';
import applyProperty from '../applyProperty.js';
import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';

export default function applySavingThrow(node, {creature, targets, scope, log}){
  const prop = node.node;

  let saveTargets = prop.target === 'self' ? [creature] : targets;

  recalculateCalculation(prop.dc, scope, log);

  const dc = (prop.dc?.value);
  if (!isFinite(dc)){
    log.content.push({
      name: 'Error',
      value: 'Saving throw requires a DC',
    });
    return node.children.forEach(child => applyProperty(child, {
      creature, targets, scope, log
    }));
  }
  log.content.push({
    name: prop.name,
    value: `DC **${dc}**`,
    inline: true,
  });

  // If there are no save targets, apply all children as if the save both
  // succeeeded and failed
  if (!saveTargets?.length){
    scope['$saveFailed'] = {value: true};
    scope['$saveSucceeded'] = {value: true};
    return node.children.forEach(child => applyProperty(child, {
      creature, targets, scope, log
    }));
  }

  // Each target makes the saving throw
  saveTargets.forEach(target => {
    delete scope['$saveFailed'];
    delete scope['$saveSucceeded'];
    delete scope['$saveDiceRoll'];
    delete scope['$saveRoll'];

    const applyChildren = function(){
      node.children.forEach(child => applyProperty(child, {
        creature, targets: [target], scope, log
      }));
    };

    const save = target.variables[prop.stat];

    if (!save){
      log.content.push({
        name: 'Saving throw error',
        value: 'No saving throw found: ' + prop.stat,
      });
      return applyChildren();
    }

    const rollModifierText = numberToSignedString(save.value, true);

    let value, values, resultPrefix;
    if (save.advantage === 1){
      const [a, b] = rollDice(2, 20);
      if (a >= b) {
        value = a;
        resultPrefix = `Advantage\n1d20 [ ${a}, ~~${b}~~ ] ${rollModifierText}`;
      } else {
        value = b;
        resultPrefix = `Advantage\n1d20 [ ~~${a}~~, ${b} ] ${rollModifierText}`;
      }
    } else if (save.advantage === -1){
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
    scope['$saveDiceRoll'] = {value};
    const result = value + save.value || 0;
    scope['$saveRoll'] = {value: result};
    const saveSuccess = result >= dc;
    if (saveSuccess){
      scope['$saveSucceeded'] = {value: true};
    } else {
      scope['$saveFailed'] = {value: true};
    }
    log.content.push({
      name: saveSuccess ? 'Successful save' : 'Failed save',
      value: resultPrefix + '\n**' + result + '**',
      inline: true,
    });
    return applyChildren();
  });
}
