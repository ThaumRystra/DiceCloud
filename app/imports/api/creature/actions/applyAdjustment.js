import evaluateString from '/imports/api/creature/computation/afterComputation/evaluateString.js';
import damagePropertiesByName from '/imports/api/creature/creatureProperties/methods/damagePropertiesByName.js';

export default function applyAdjustment({
  prop,
  creature,
  targets,
  actionContext,
  log
}){
  let damageTargets = prop.target === 'self' ? [creature] : targets;
  let scope = {
    ...creature.variables,
    ...actionContext,
  };
  var {result, context} = evaluateString({
    string: prop.amount,
    scope,
    fn: 'reduce'
  });
  context.errors.forEach(e => {
    log.content.push({
      name: 'Attribute damage error',
      error: e.message || e.toString(),
    });
  });
  if (damageTargets) {
    damageTargets.forEach(target => {
      if (prop.target === 'each'){
        ({result} = evaluateString({
          string: prop.amount,
          scope,
          fn: 'reduce'
        }));
      }
      damagePropertiesByName.call({
        creatureId: target._id,
        variableName: prop.stat,
        operation: prop.operation || 'increment',
        value: result.value,
      });
      log.content.push({
        name: 'Attribute damage',
        resultPrefix: `${prop.stat} ${prop.operation === 'set' ? 'set to' : ''}`,
        result: `${result.isNumber ? -result.value : result.toString()}`,
      });
    });
  } else {
    log.content.push({
      name: 'Attribute damage',
      resultPrefix: `${prop.stat} ${prop.operation === 'set' ? 'set to' : ''}`,
      result: `${result.isNumber ? -result.value : result.toString()}`,
    });
  }
}
