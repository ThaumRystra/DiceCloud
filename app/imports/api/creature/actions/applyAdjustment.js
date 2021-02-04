import evaluateString from '/imports/api/creature/computation/afterComputation/evaluateString.js';
import {insertCreatureLog} from '/imports/api/creature/log/CreatureLogs.js';
import damagePropertiesByName from '/imports/api/creature/creatureProperties/methods/damagePropertiesByName.js';

export default function applyAdjustment({
  prop,
  creature,
  targets,
  actionContext
}){
  let damageTargets = prop.target === 'self' ? [creature] : targets;
  let scope = {
    ...creature.variables,
    ...actionContext,
  };
  try {
    var {result, errors} = evaluateString(prop.amount, scope, 'reduce');
    if (typeof result !== 'number') {
      return insertCreatureLog.call({ log: {
        text: errors.join(', ') || 'Something went wrong',
        creatureId: creature._id,
      }});
    }
  } catch (e){
    return insertCreatureLog.call({ log: {
      text: e.toString(),
      creatureId: creature._id,
    }});
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
      insertCreatureLog.call({
        log: {
          text: `${prop.stat} ${prop.operation === 'set' ? 'set to' : ''} ${-result}`,
          creatureId: target._id,
        }
      });
    });
  } else {
    insertCreatureLog.call({
      log: {
        text: `${prop.stat} ${prop.operation === 'set' ? 'set to' : ''} ${-result}`,
        creatureId: creature._id,
      }
    });
  }
}
