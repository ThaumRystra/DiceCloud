import { some, intersection, difference } from 'lodash';
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
  if (!prop.amount?.parseNode) return;

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

  // roll the dice only and store that string
  applyEffectsToCalculationParseNode(prop.amount, log);
  const {result: rolled} = resolve('roll', prop.amount.parseNode, scope, context);
  if (rolled.parseType !== 'constant'){
    logValue.push(toString(rolled));
  }
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
  let damage = +reduced.value;

  // If we didn't end up with a constant of finite amount, give up
  if (reduced?.parseType !== 'constant' || !isFinite(reduced.value)){
    return applyChildren();
  }

  // Round the damage to a whole number
  damage = Math.floor(damage);

  // Memoise the damage suffix for the log
  let suffix = (criticalHit ? ' critical ' : ' ') +
    prop.damageType +
    (prop.damageType !== 'healing' ? ' damage ': '');

  if (damageTargets && damageTargets.length) {
    // Iterate through all the targets
    damageTargets.forEach(target => {

      // Apply weaknesses/resistances/immunities
      damage = applyDamageMultipliers({
        target,
        damage,
        damageProp: prop,
        logValue
      });

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
    inline: true,
  });
  return applyChildren();
}

function applyDamageMultipliers({target, damage, damageProp, logValue}){
  const damageType = damageProp?.damageType;
  if (!damageType) return damage;

  const multiplier = target?.variables?.[damageType];
  if (!multiplier) return damage;

  const damageTypeText = damageType == 'healing' ? 'healing': `${damageType} damage`;

  if (
    multiplier.immunity &&
    some(multiplier.immunities, multiplierAppliesTo(damageProp))
  ){
    logValue.push(`Immune to ${damageTypeText}`);
    return 0;
  } else {
    if (
      multiplier.resistance &&
      some(multiplier.resistances, multiplierAppliesTo(damageProp))
    ){
      logValue.push(`Resistant to ${damageTypeText}`);
      damage = Math.floor(damage / 2);
    }
    if (
      multiplier.vulnerability &&
      some(multiplier.vulnerabilities, multiplierAppliesTo(damageProp))
    ){
      logValue.push(`Vulnerable to ${damageTypeText}`);
      damage = Math.floor(damage * 2);
    }
  }
  return damage;
}

function multiplierAppliesTo(damageProp){
  return multiplier => {
    const hasRequiredTags = difference(
      multiplier.includeTags, damageProp.tags
    ).length === 0;

    const hasNoExcludedTags = intersection(
      multiplier.excludeTags, damageProp.tags
    ).length === 0;

    return hasRequiredTags && hasNoExcludedTags;
  }
}
