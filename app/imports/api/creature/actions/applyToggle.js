import evaluateString from '/imports/api/creature/computation/afterComputation/evaluateString.js';

export default function applyToggle({
  prop,
  creature,
  actionContext,
  log,
}){
  let scope = {
    ...creature.variables,
    ...actionContext,
  };
  if (Number.isFinite(+prop.condition)){
    return !!+prop.condition;
  }
  try {
    var {result, errors} = evaluateString(prop.condition, scope, 'reduce');
    if (typeof result !== 'number' && typeof result !== 'boolean') {
      log.content.push({
        error: errors.join(', '),
      });
      return false;
    }
    log.content.push({
      name: prop.name,
      resultPrefix: prop.condition + ' = ',
      result,
    });
    return !!result;
  } catch (e){
    log.content.push({
      error: e.toString(),
    });
  }
}
