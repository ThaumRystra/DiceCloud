import applyProperty from '../applyProperty.js';
import dealDamage from '/imports/api/creature/creatureProperties/methods/dealDamage.js';
import {insertCreatureLog} from '/imports/api/creature/log/CreatureLogs.js';
import recalculateCalculation from './shared/recalculateCalculation.js';
import { Context } from '/imports/parser/resolve.js';

export default function applyDamage(node, {
  creature, targets, scope, log
}){
  const applyChildren = function(){
    node.children.forEach(child => applyProperty(child, {
      creature, targets, scope, log
    }));
  };

  const prop = node.node;
  let damageTargets = prop.target === 'self' ? [creature] : targets;
  // Determine if the hit is critical
  let criticalHit = scope['$criticalHit']?.value &&
    prop.damageType !== 'healing' // Can't critically heal
  ;
  // Double the damage rolls if the hit is critical
  let context = new Context({
    options: {doubleRolls: criticalHit},
  });
  recalculateCalculation(prop.amount, scope, log, context);

  // If we didn't end up with a finite amount, give up
  if (!isFinite(prop.amount?.value)) return applyChildren();

  // Memoise the damage suffix for the log
  let suffix = (criticalHit ? ' critical ' : ' ') +
    prop.damageType +
    (prop.damageType !== ' healing ' ? ' damage ': '');

  if (damageTargets && damageTargets.length) {
    // Iterate through all the targets
    damageTargets.forEach(target => {
      let name = prop.damageType === 'healing' ? 'Healing' : 'Damage';

      // Deal the damage to the target
      let damageDealt = dealDamage.call({
        creatureId: target._id,
        damageType: prop.damageType,
        amount: prop.amount.value,
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
      value: prop.amount.value + suffix,
    });
  }
  return applyChildren();
}
