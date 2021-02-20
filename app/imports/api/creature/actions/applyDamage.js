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
      let name = prop.damageType === 'healing' ? 'Healing' : 'Damage';
      let suffix = prop.damageType +
        prop.damageType !== 'healing' ? ' damage': '';
      if (prop.target === 'each'){
        result = evaluateString(prop.amount, scope, 'reduce');
      }
      let damageDealt = dealDamage.call({
        creatureId: target._id,
        damageType: prop.damageType,
        amount: result,
      });
      if (target._id === creature._id){
        log.content.push({
          name,
          result: damageDealt,
          details: suffix + 'to self',
        });
      } else {
        log.content.push({
          name,
          resultPrefix: 'Dealt ',
          result: damageDealt,
          details: suffix + `${target.name && ' to '}${target.name}`,
        });
        insertCreatureLog.call({
          log: {
            content: [{
              name,
              resultPrefix: 'Recieved ',
              result: damageDealt,
              details: suffix,
            }],
            creatureId: target._id,
          }
        });
      }
    });
  } else {
    log.content.push({
      name: prop.damageType === 'healing' ? 'Healing' : 'Damage',
      result,
      details: `${prop.damageType}${prop.damageType !== 'healing'? ' damage': ''}`,
    });
  }
}
