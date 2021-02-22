import evaluateString from '/imports/api/creature/computation/afterComputation/evaluateString.js';

export default function applyRoll({
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
    var {result, errors} = evaluateString(prop.roll, scope, 'reduce');
    actionContext[prop.variableName] = result;
    log.content.push({
      name: prop.name,
      resultPrefix: prop.variableName + ' = ' + prop.roll + ' = ',
      result,
    });
    if (errors.length) {
      log.content.push({
        error: errors.join(', '),
      });
    }

  } catch (e){
    log.content.push({
      error: e.toString(),
    });
  }
}
