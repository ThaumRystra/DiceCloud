import evaluateString from '/imports/api/creature/computation/afterComputation/evaluateString.js';
import {insertCreatureLog} from '/imports/api/creature/log/CreatureLogs.js';
import dealDamage from '/imports/api/creature/creatureProperties/methods/dealDamage.js';

export default function applyDamage({
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
        text: errors.join(', '),
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
      let damageDealt = dealDamage.call({
        creatureId: target._id,
        damageType: prop.damageType,
        amount: result,
      });
      insertCreatureLog.call({
        log: {
          text: `Recieved ${damageDealt} ${prop.damageType}${prop.damageType !== 'healing'? ' damage': ''}`,
          creatureId: target._id,
        }
      });
      if (target._id !== creature._id){
        insertCreatureLog.call({
          log: {
            text: `Dealt ${damageDealt} ${prop.damageType}${prop.damageType !== 'healing'? ' damage': ''}`,
            creatureId: creature._id,
          }
        });
      }
    });
  } else {
    insertCreatureLog.call({
      log: {
        text: `${result} ${prop.damageType}${prop.damageType !== 'healing'? ' damage': ''}`,
        creatureId: creature._id,
      }
    });
  }
}
