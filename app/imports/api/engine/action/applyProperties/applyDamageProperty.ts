import { some, includes, difference, intersection } from 'lodash';

import { getConstantValueFromScope } from '/imports/api/creature/creatures/CreatureVariables';
import { EngineAction } from '/imports/api/engine/action/EngineActions';
import { applyDefaultAfterPropTasks } from '/imports/api/engine/action/functions/applyTaskGroups';
import { getEffectiveActionScope } from '/imports/api/engine/action/functions/getEffectiveActionScope';
import recalculateCalculation from '/imports/api/engine/action/functions/recalculateCalculation';
import { PropTask } from '/imports/api/engine/action/tasks/Task';
import TaskResult from '/imports/api/engine/action/tasks/TaskResult';
import { isFiniteNode } from '/imports/parser/parseTree/constant';
import resolve from '/imports/parser/resolve';
import toString from '/imports/parser/toString';
import { getPropertiesOfType } from '/imports/api/engine/loadCreatures';
import applyTask from '/imports/api/engine/action/tasks/applyTask';
import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';
import getEffectivePropTags from '/imports/api/engine/computation/utility/getEffectivePropTags';
import Context from '/imports/parser/types/Context';
import applySavingThrowProperty from '/imports/api/engine/action/applyProperties/applySavingThrowProperty';

export default async function applyDamageProperty(
  task: PropTask, action: EngineAction, result: TaskResult, inputProvider: InputProvider
) {
  const prop = task.prop;
  const scope = await getEffectiveActionScope(action);

  // Choose target
  const damageTargets = prop.target === 'self' ? [action.creatureId] : task.targetIds;

  // Skip if there is no parse node to work with
  if (!prop.amount?.valueNode) {
    return applyDefaultAfterPropTasks(action, prop, damageTargets, inputProvider);
  }

  // Determine if the hit is critical
  const criticalHit = await getConstantValueFromScope('~criticalHit', scope)
    && prop.damageType !== 'healing'; // Can't critically heal
  // Double the damage rolls if the hit is critical
  const context = new Context({
    options: { doubleRolls: criticalHit },
  });

  // Gather all the lines we need to log into an array
  const logValue: string[] = [];
  const logName = prop.damageType === 'healing' ? 'Healing' : 'Damage';

  // roll the dice only and store that string
  await recalculateCalculation(prop.amount, action, 'compile', inputProvider);
  const { result: rolled } = await resolve('roll', prop.amount.valueNode, scope, context, inputProvider);
  if (rolled.parseType !== 'constant') {
    logValue.push(toString(rolled));
  }
  result.appendParserContextErrors(context, damageTargets);

  // Reset the errors so we don't log the same errors twice
  context.errors = [];

  // Resolve the roll to a final value
  const { result: reduced } = await resolve('reduce', rolled, scope, context, inputProvider);
  result.appendParserContextErrors(context, damageTargets);

  // Store the result
  let damage: number | undefined = undefined;
  if (reduced.parseType === 'constant') {
    prop.amount.value = reduced.value;
    if (typeof reduced.value === 'number') {
      damage = reduced.value;
    }
  } else if (reduced.parseType === 'error') {
    prop.amount.value = null;
  } else {
    prop.amount.value = toString(reduced);
  }

  // If we didn't end up with damage of finite amount, give up
  if (
    typeof damage !== 'number'
    || !isFinite(damage)
  ) {
    return applyDefaultAfterPropTasks(action, prop, damageTargets, inputProvider);
  }

  // Round the damage to a whole number
  damage = Math.floor(damage);
  scope['~damage'] = { value: damage };

  // Convert extra damage into the stored type
  const lastDamageType = await getConstantValueFromScope('~lastDamageType', scope);
  if (prop.damageType === 'extra' && typeof lastDamageType === 'string') {
    prop.damageType = lastDamageType;
  }
  // Store current damage type
  if (prop.damageType !== 'healing') {
    scope['~lastDamageType'] = { value: prop.damageType };
  }

  // Memoise the damage suffix for the log
  const suffix = (criticalHit ? 'critical ' : '') +
    prop.damageType +
    (prop.damageType !== 'healing' ? ' damage' : '');

  // If there is a save, calculate the save damage
  let damageOnSave, saveProp, saveRoll;
  if (prop.save) {
    if (prop.save.damageFunction?.calculation) {
      await recalculateCalculation(prop.save.damageFunction, action, 'compile', inputProvider);
      context.errors = [];
      const { result: saveDamageRolled } = await resolve(
        'roll', prop.save.damageFunction.valueNode, scope, context, inputProvider
      );
      saveRoll = toString(saveDamageRolled);
      const { result: saveDamageResult } = await resolve(
        'reduce', saveDamageRolled, scope, context, inputProvider
      );
      result.appendParserContextErrors(context, damageTargets);
      // If we didn't end up with a constant of finite amount, give up
      if (
        !isFiniteNode(saveDamageResult)
      ) {
        return applyDefaultAfterPropTasks(action, prop, damageTargets, inputProvider);
      }
      // Round the damage to a whole number
      damageOnSave = Math.floor(saveDamageResult.value);
    } else {
      damageOnSave = Math.floor(damage / 2);
    }
    saveProp = {
      node: {
        ...prop.save,
        name: prop.save.stat,
        silent: prop.silent,
      },
      children: [],
    }
  }

  if (damageTargets && damageTargets.length) {
    // Iterate through all the targets
    for (const target of damageTargets) {
      let damageToApply = damage || 0;

      // If there is a saving throw, apply that first
      if (prop.save) {
        await applySavingThrowProperty({
          prop: saveProp,
          targetIds: task.targetIds,
        }, action, result, inputProvider);
        if (await getConstantValueFromScope('~saveSucceeded', scope)) {
          // Log the total damage
          logValue.push(toString(reduced));
          // Log the save damage
          const damageText = damageFunctionText(prop.save);
          if (damageText) {
            logValue.push(damageText);
          } else {
            logValue.push(
              '**Damage on successful save**',
              prop.save.damageFunction.calculation,
              saveRoll
            );
          }
          damageToApply = damageOnSave;
        }
      }

      // Apply weaknesses/resistances/immunities
      damageToApply = applyDamageMultipliers({
        target,
        damage: damageToApply,
        damageProp: prop,
        logValue
      });

      // Deal the damage to the target
      await dealDamage(
        action, prop, result, inputProvider, target, prop.damageType, damageToApply
      );
    }
  } else {
    // There are no targets, just log the result
    logValue.push(`**${damage}** ${suffix}`);
    if (prop.save) {
      await applySavingThrowProperty(saveProp, action, result, inputProvider);
      await applySavingThrowProperty({
        prop: saveProp,
        targetIds: task.targetIds,
      }, action, result, inputProvider);
      logValue.push(`**${damageOnSave}** ${suffix} on a successful save`);
    }
  }
  if (logValue.length) result.appendLog({
    name: logName,
    value: logValue.join('\n'),
    inline: true,
    silenced: prop.silent,
  }, damageTargets);
  return applyDefaultAfterPropTasks(action, prop, damageTargets, inputProvider);
}

function damageFunctionText(save) {
  if (!save) return;
  if (!save.damageFunction) {
    return '**Half damage on successful save**';
  }
  if (save.damageFunction.calculation == '0' || save.damageFunction.value === 0) {
    return '**No damage on successful save**'
  }
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

async function dealDamage(
  action: EngineAction, prop: any, result: TaskResult, userInput: InputProvider,
  targetId: string, damageType: string, amount: number
) {
  // Get all the health bars and do damage to them
  let healthBars = getPropertiesOfType(targetId, 'attribute');

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
  for (const healthBar of healthBars) {
    if (damageLeft === 0) return;
    // Do the damage
    const damageAdded = await applyTask(action, {
      targetIds: [targetId],
      subtaskFn: 'damageProp',
      params: {
        operation: 'increment',
        value: +damageLeft || 0,
        targetProp: healthBar,
      },
    }, userInput);

    damageLeft -= damageAdded;
    // Prevent overflow
    if (
      damageType === 'healing' ?
        healthBar.healthBarNoHealingOverflow :
        healthBar.healthBarNoDamageOverflow
    ) {
      damageLeft = 0;
    }
  }
  return totalDamage;
}
