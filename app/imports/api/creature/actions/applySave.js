import evaluateString from '/imports/api/creature/computation/afterComputation/evaluateString.js';
import CreaturesProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import roll from '/imports/parser/roll.js';

export default function applySave({
  prop,
  creature,
  actionContext,
  log,
}){
  let scope = {
    ...creature.variables,
    ...actionContext,
  };
  try {
    // Calculate the DC
    var {result} = evaluateString({
      string: prop.dc,
      scope,
      fn: 'reduce'
    });
    let dc = result.value;
    log.content.push({
      name: prop.name,
      value: ' DC ' + result.toString(),
    });
    if (prop.target === 'self'){
      let save = CreaturesProperties.findOne({
        'ancestors.id': creature._id,
        type: 'skill',
        skillType: 'save',
        variableName: prop.stat,
        removed: {$ne: true},
        inactive: {$ne: true},
      });
      if (!save){
        log.content.push({
          name: 'Saving throw error',
          value: 'No saving throw found: ' + prop.stat,
        });
        return;
      }
      let value, values, resultPrefix;
      if (save.advantage === 1){
        values = roll(2, 20).sort().reverse();
        value = values[0];
        resultPrefix = `Advantage: 1d20 [${values[0]},~~${values[1]}~~] + ${save.value} = `
      } else if (save.advantage === -1){
        values = roll(2, 20).sort();
        value = values[0];
        resultPrefix = `Disadvantage: 1d20 [${values[0]},~~${values[1]}~~] + ${save.value} = `
      } else {
        values = roll(1, 20);
        value = values[0];
        resultPrefix = `1d20 [${value}] + ${save.value} = `
      }
      actionContext.savingThrowRoll = {value};
      let result = value + save.value;
      actionContext.savingThrow = {value: result};
      let saveSuccess = result >= dc;
      log.content.push({
        name: 'Save',
        value: resultPrefix + result + (saveSuccess ? 'Passed' : 'Failed')
      });
      return !saveSuccess;
    } else {
      // TODO
      return true;
    }
  } catch (e){
    log.content.push({
      name: 'Save error',
      value: e.toString(),
    });
  }
}
