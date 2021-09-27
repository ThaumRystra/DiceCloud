// import evaluateString from '/imports/api/creature/computation/afterComputation/evaluateString.js';
import dealDamage from '/imports/api/creature/creatureProperties/methods/dealDamage.js';
import {insertCreatureLog} from '/imports/api/creature/log/CreatureLogs.js';
import { CompilationContext } from '/imports/parser/parser.js';

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
  // Add the target's variables to the scope
  if (targets.length === 1){
    scope.target = targets[0].variables;
  }
  // Determine if the hit is critical
  let criticalHit = !!(
    actionContext.criticalHit &&
    actionContext.criticalHit.value &&
    prop.damageType !== 'healing' // Can't critically heal
  );
  // Double the damage rolls if the hit is critical
  let context = new CompilationContext({
    doubleRolls: criticalHit,
  });

  // Compute the roll the first time, logging any errors
  var {result} = evaluateString({
    string: prop.amount,
    scope,
    fn: 'reduce',
    context
  });

  // If the result is an error bail out now
  if (result.constructor.name === 'ErrorNode'){
    log.content.push({
      name: 'Damage error',
      value: result.toString(),
    });
    return;
  }

  // Memoise the damage suffix for the log
  let suffix = (criticalHit ? ' critical ' : ' ') +
    prop.damageType +
    (prop.damageType !== ' healing ' ? ' damage ': '');

  if (damageTargets && damageTargets.length) {
    // Iterate through all the targets
    damageTargets.forEach(target => {
      let name = prop.damageType === 'healing' ? 'Healing' : 'Damage';

      // Reroll the damage if needed
      if (prop.target === 'each'){
        ({result, context} = evaluateString({
          string: prop.amount,
          scope,
          fn: 'reduce'
        }));
      }
      // If the result is an error or not a number bail out now
      if (result.constructor.name === 'ErrorNode' || !result.isNumber){
        log.content.push({
          name: 'Damage error',
          value: result.toString(),
        });
        return;
      }

      // Deal the damage to the target
      let damageDealt = dealDamage.call({
        creatureId: target._id,
        damageType: prop.damageType,
        amount: result.value,
      });

      // Log the damage done
      if (target._id === creature._id){
        // Target is same as self, log damage as such
        log.content.push({
          name,
          value: damageDealt + suffix + ' to self',
        });
      } else {
        log.content.push({
          name,
          value: 'Dealt ' + damageDealt + suffix + ` ${target.name && ' to '}${target.name}`,
        });
        // Log the damage received on that creature's log as well
        insertCreatureLog.call({
          log: {
            creatureId: target._id,
            content: [{
              name,
              value: 'Recieved ' + damageDealt + suffix,
            }],
          }
        });
      }
    });
  } else {
    // There are no targets, just log the result
    log.content.push({
      name: prop.damageType === 'healing' ? 'Healing' : 'Damage',
      value: result.toString() + suffix,
    });
  }
}
