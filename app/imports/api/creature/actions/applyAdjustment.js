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
  try {
    var {result, errors} = evaluateString(prop.amount, scope, 'reduce');
    if (typeof result !== 'number') {
      log.content.push({error: errors.join(', ') || 'Something went wrong'});
    }
  } catch (e){
    log.content.push({error: e.toString()});
  }
  if (damageTargets) {
    damageTargets.forEach(target => {
      if (prop.target === 'each'){
        result = evaluateString(prop.amount, scope, 'reduce');
      }
      damagePropertiesByName.call({
        creatureId: target._id,
        variableName: prop.stat,
        operation: prop.operation || 'increment',
        value: result
      });
      log.content.push({
        resultPrefix: `${prop.stat} ${prop.operation === 'set' ? 'set to' : ''}`,
        result: `${-result}`,
      });
    });
  } else {
    log.content.push({
      resultPrefix: `${prop.stat} ${prop.operation === 'set' ? 'set to' : ''}`,
      result: `${-result}`,
    });
  }
}
