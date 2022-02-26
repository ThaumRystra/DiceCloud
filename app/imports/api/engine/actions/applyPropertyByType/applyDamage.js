import applyProperty from '../applyProperty.js';
import { dealDamageWork } from '/imports/api/creature/creatureProperties/methods/dealDamage.js';
import {insertCreatureLog} from '/imports/api/creature/log/CreatureLogs.js';
import resolve, { Context, toString } from '/imports/parser/resolve.js';
import logErrors from './shared/logErrors.js';
import applyEffectsToCalculationParseNode from '/imports/api/engine/actions/applyPropertyByType/shared/applyEffectsToCalculationParseNode.js';

export default function applyDamage(node, {
  creature, targets, scope, log
}){
  const applyChildren = function(){
    node.children.forEach(child => applyProperty(child, {
      creature, targets, scope, log
    }));
  };

  const prop = node.node;

  // Skip if there is no parse node to work with
  if (!prop.amount.parseNode) return;

  // Choose target

  let damageTargets = prop.target === 'self' ? [creature] : targets;
  // Determine if the hit is critical
  let criticalHit = scope['$criticalHit']?.value &&
    prop.damageType !== 'healing' // Can't critically heal
  ;
  // Double the damage rolls if the hit is critical
  let context = new Context({
    options: {doubleRolls: criticalHit},
  });

  // Gather all the lines we need to log into an array
  const logValue = [];
  const logName = prop.damageType === 'healing' ? 'Healing' : 'Damage';

  // Compile the dice roll and store that string first
  // const {result: compiled} = resolve('compiled', prop.amount.parseNode, scope, context);
  // logValue.push(toString(compiled));
  // logErrors(context.errors, log);

  // roll the dice only and store that string
  applyEffectsToCalculationParseNode(prop.amount, log);
  const {result: rolled} = resolve('roll', prop.amount.parseNode, scope, context);
  logValue.push(toString(rolled));
  logErrors(context.errors, log);

  // Reset the errors so we don't log the same errors twice
  context.errors = [];

  // Resolve the roll to a final value
  const {result: reduced} = resolve('reduce', rolled, scope, context);
  logErrors(context.errors, log);

  // Store the result
  if (reduced.parseType === 'constant'){
    prop.amount.value = reduced.value;
  } else if (reduced.parseType === 'error'){
    prop.amount.value = null;
  } else {
    prop.amount.value = toString(reduced);
  }

  const damage = +reduced.value;

  // If we didn't end up with a constant of finite amount, give up
  if (reduced?.parseType !== 'constant' && !isFinite(reduced.value)){
    return applyChildren();
  }

  // Memoise the damage suffix for the log
  let suffix = (criticalHit ? ' critical ' : ' ') +
    prop.damageType +
    (prop.damageType !== 'healing' ? ' damage ': '');

  if (damageTargets && damageTargets.length) {
    // Iterate through all the targets
    damageTargets.forEach(target => {

      // Deal the damage to the target
      let damageDealt = dealDamageWork({
        creature: target,
        damageType: prop.damageType,
        amount: damage,
      });

      // Log the damage done
      if (target._id === creature._id){
        // Target is same as self, log damage as such
        logValue.push(`**${damageDealt}** ${suffix}  to self`);
      } else {
        logValue.push(`Dealt **${damageDealt}** ${suffix} ${target.name && ' to '}${target.name}`);
        // Log the damage received on that creature's log as well
        insertCreatureLog.call({
          log: {
            creatureId: target._id,
            content: [{
              name,
              value: `Recieved **${damageDealt}** ${suffix}`,
            }],
          }
        });
      }
    });
  } else {
    // There are no targets, just log the result
    logValue.push(`**${damage}** ${suffix}`);
  }
  log.content.push({
    name: logName,
    value: logValue.join('\n'),
  });
  return applyChildren();
}
