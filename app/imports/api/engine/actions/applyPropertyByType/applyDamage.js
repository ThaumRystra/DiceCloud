import { some, intersection, difference, remove, includes } from 'lodash';
import applyChildren from '/imports/api/engine/actions/applyPropertyByType/shared/applyChildren.js';
import { insertCreatureLog } from '/imports/api/creature/log/CreatureLogs.js';
import resolve, { Context, toString } from '/imports/parser/resolve.js';
import logErrors from './shared/logErrors.js';
import applyEffectsToCalculationParseNode from '/imports/api/engine/actions/applyPropertyByType/shared/applyEffectsToCalculationParseNode.js';
import { damagePropertyWork } from '/imports/api/creature/creatureProperties/methods/damageProperty.js';
import {
  getPropertiesOfType
} from '/imports/api/engine/loadCreatures.js';
import { applyNodeTriggers } from '/imports/api/engine/actions/applyTriggers.js';
import getEffectivePropTags from '/imports/api/engine/computation/utility/getEffectivePropTags.js';

export default function applyDamage(node, actionContext) {
  applyNodeTriggers(node, 'before', actionContext);

  const prop = node.node;
  const scope = actionContext.scope;

  // Skip if there is no parse node to work with
  if (!prop.amount?.parseNode) return;

  // Choose target
  let damageTargets = prop.target === 'self' ? [actionContext.creature] : actionContext.targets;
  // Determine if the hit is critical
  let criticalHit = scope['~criticalHit']?.value &&
    prop.damageType !== 'healing' // Can't critically heal
    ;
  // Double the damage rolls if the hit is critical
  let context = new Context({
    options: { doubleRolls: criticalHit },
  });

  // Gather all the lines we need to log into an array
  const logValue = [];
  const logName = prop.damageType === 'healing' ? 'Healing' : 'Damage';

  // roll the dice only and store that string
  applyEffectsToCalculationParseNode(prop.amount, actionContext.log);
  const { result: rolled } = resolve('roll', prop.amount.parseNode, scope, context);
  if (rolled.parseType !== 'constant') {
    logValue.push(toString(rolled));
  }
  logErrors(context.errors, actionContext);

  // Reset the errors so we don't log the same errors twice
  context.errors = [];

  // Resolve the roll to a final value
  const { result: reduced } = resolve('reduce', rolled, scope, context);
  logErrors(context.errors, actionContext);

  // Store the result
  if (reduced.parseType === 'constant') {
    prop.amount.value = reduced.value;
  } else if (reduced.parseType === 'error') {
    prop.amount.value = null;
  } else {
    prop.amount.value = toString(reduced);
  }
  let damage = +reduced.value;

  // If we didn't end up with a constant of finite amount, give up
  if (reduced?.parseType !== 'constant' || !isFinite(reduced.value)) {
    return applyChildren(node, actionContext);
  }

  // Round the damage to a whole number
  damage = Math.floor(damage);

  // Convert extra damage into the stored type
  if (prop.damageType === 'extra' && scope['~lastDamageType']?.value) {
    prop.damageType = scope['~lastDamageType']?.value;
  }
  // Store current damage type
  if (prop.damageType !== 'healing') {
    scope['~lastDamageType'] = { value: prop.damageType };
  }

  // Memoise the damage suffix for the log
  let suffix = (criticalHit ? ' critical ' : ' ') +
    prop.damageType +
    (prop.damageType !== 'healing' ? ' damage ' : '');

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

      actionContext.target = [target];
      // Deal the damage to the target
      let damageDealt = dealDamage({
        target,
        damageType: prop.damageType,
        amount: damage,
        actionContext
      });

      // Log the damage done
      if (target._id === actionContext.creature._id) {
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
  if (!prop.silent) actionContext.addLog({
    name: logName,
    value: logValue.join('\n'),
    inline: true,
  });
  return applyChildren(node, actionContext);
}

function applyDamageMultipliers({ target, damage, damageProp, logValue }) {
  const damageType = damageProp?.damageType;
  if (!damageType) return damage;

  const multiplier = target?.variables?.[damageType];
  if (!multiplier) return damage;

  const damageTypeText = damageType == 'healing' ? 'healing' : `${damageType} damage`;

  if (
    multiplier.immunity &&
    some(multiplier.immunities, multiplierAppliesTo(damageProp, 'immunity'))
  ) {
    logValue.push(`Immune to ${damageTypeText}`);
    return 0;
  } else {
    if (
      multiplier.resistance &&
      some(multiplier.resistances, multiplierAppliesTo(damageProp, 'resistance'))
    ) {
      logValue.push(`Resistant to ${damageTypeText}`);
      damage = Math.floor(damage / 2);
    }
    if (
      multiplier.vulnerability &&
      some(multiplier.vulnerabilities, multiplierAppliesTo(damageProp, 'vulnerability'))
    ) {
      logValue.push(`Vulnerable to ${damageTypeText}`);
      damage = Math.floor(damage * 2);
    }
  }
  return damage;
}

function multiplierAppliesTo(damageProp, multiplierType) {
  return multiplier => {
    // Apply the default 'ignore x' tags
    const effectiveTags = getEffectivePropTags(damageProp);
    if (includes(effectiveTags, `ignore ${multiplierType}`)) return false;

    const hasRequiredTags = difference(
      multiplier.includeTags, effectiveTags
    ).length === 0;

    const hasNoExcludedTags = intersection(
      multiplier.excludeTags, effectiveTags
    ).length === 0;

    return hasRequiredTags && hasNoExcludedTags;
  }
}

function dealDamage({ target, damageType, amount, actionContext }) {
  // Get all the health bars and do damage to them
  let healthBars = getPropertiesOfType(target._id, 'attribute');

  // Keep only the healthbars that can take damage/healing
  healthBars = healthBars.filter((bar) => {
    if (bar.attributeType !== 'healthBar' || bar.inactive || bar.removed || bar.overridden) {
      return false;
    }
    if (damageType === 'healing' && bar.healthBarNoHealing) {
      return false;
    }
    if (damageType !== 'healing' && amount >= 0 && bar.healthBarNoDamage) {
      return false;
    }
    return true;
  });

  // Sort healthbars by damage/healing order or tree order as a fallback
  healthBars.sort((a, b) => {
    let diff;
    if (amount >= 0) {
      diff = a.healthBarDamageOrder - b.healthBarDamageOrder;
    } else {
      diff = a.healthBarHealingOrder - b.healthBarHealingOrder;
    }
    if (Number.isFinite(diff)) {
      return diff;
    } else {
      return a.order - b.order;
    }
  });

  // Deal the damage to each healthbar in order until all damage is done
  const totalDamage = amount;
  let damageLeft = totalDamage;
  if (damageType === 'healing') damageLeft = -totalDamage;
  healthBars.forEach(healthBar => {
    if (damageLeft === 0) return;
    // Replace the healthbar by the one in the action context if we can
    // The damagePropertyWork function bashes the prop with the damage
    // So we can use the new value in later action properties
    if (healthBar.variableName) {
      const targetHealthBar = target.variables[healthBar.variableName];
      if (targetHealthBar?._id === healthBar._id) {
        healthBar = targetHealthBar;
      }
    }
    // Do the damage
    let damageAdded = damagePropertyWork({
      prop: healthBar,
      operation: 'increment',
      value: damageLeft,
      actionContext
    });
    damageLeft -= damageAdded;
    // Prevent overflow
    if (
      damageType === 'healing' ?
        healthBar.healthBarNoHealingOverflow :
        healthBar.healthBarNoDamageOverflow
    ) {
      damageLeft = 0;
    }
  });
  return totalDamage;
}
