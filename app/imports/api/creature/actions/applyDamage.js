import evaluateString from '/imports/api/creature/computation/afterComputation/evaluateString.js';
import dealDamage from '/imports/api/creature/creatureProperties/methods/dealDamage.js';
import {insertCreatureLog} from '/imports/api/creature/log/CreatureLogs.js';

export default function applyDamage({
  prop,
  creature,
  targets,
  actionContext,
  log,
}){
  let damageTargets = prop.target === 'self' ? [creature] : targets;
  let scope = {
    ...creature.variables,
    ...actionContext,
  };
  try {
    var {result, errors} = evaluateString(prop.amount, scope, 'reduce');
    if (typeof result !== 'number') {
      log.content.push({
        error: errors.join(', '),
      });
    }
  } catch (e){
    log.content.push({
      error: e.toString(),
    });
  }
  if (damageTargets && damageTargets.length) {
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
        log.content.push({
          result: damageDealt,
          details: `${prop.damageType}${prop.damageType !== 'healing'? ' damage': ''}` +
            `${target.name && ' to '}${target.name}`,
        });
      }
    });
  } else {
    log.content.push({
      result,
      details: `${prop.damageType}${prop.damageType !== 'healing'? ' damage': ''}`,
    });
  }
}
