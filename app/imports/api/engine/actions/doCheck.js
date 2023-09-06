import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions.js';
import rollDice from '/imports/parser/rollDice.js';
import numberToSignedString from '/imports/api/utility/numberToSignedString.js';
import { applyTriggers } from '/imports/api/engine/actions/applyTriggers.js';
import ActionContext from '/imports/api/engine/actions/ActionContext.js';
import evaluateCalculation from '/imports/api/engine/computation/utility/evaluateCalculation.js';

const doCheck = new ValidatedMethod({
  name: 'creatureProperties.doCheck',
  validate: new SimpleSchema({
    propId: SimpleSchema.RegEx.Id,
    scope: {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 10,
    timeInterval: 5000,
  },
  run({ propId, scope }) {
    const prop = CreatureProperties.findOne(propId);
    const creatureId = prop.ancestors[0].id;
    const actionContext = new ActionContext(creatureId, [creatureId], this);
    Object.assign(actionContext.scope, scope);
    actionContext.scope[`#${prop.type}`] = prop;

    // Check permissions
    assertEditPermission(actionContext.creature, this.userId);

    // Do the check
    doCheckWork({ prop, actionContext });
  },
});

export default doCheck;

export function doCheckWork({ prop, actionContext }) {

  applyTriggers(actionContext.triggers.check?.before, prop, actionContext);
  rollCheck(prop, actionContext);
  applyTriggers(actionContext.triggers.check?.after, prop, actionContext);

  // Insert the log
  actionContext.writeLog();
}

function rollCheck(prop, actionContext) {
  const scope = actionContext.scope;
  // get the modifier for the roll
  let rollModifier;
  let logName = `${prop.name} check`;
  if (prop.type === 'skill') {
    rollModifier = prop.value;
    if (prop.skillType === 'save') {
      if (prop.name.match(/save/i)) {
        logName = prop.name;
      } else {
        logName = prop.name ? `${prop.name} save` : 'Saving Throw';
      }
    }
  } else if (prop.type === 'attribute') {
    if (prop.attributeType === 'ability') {
      rollModifier = prop.modifier;
    } else {
      rollModifier = prop.value;
    }
  } else {
    throw (`${prop.type} not supported for checks`);
  }

  let rollModifierText = numberToSignedString(rollModifier, true);

  const { effectBonus, effectString } = applyUnresolvedEffects(prop, scope)
  rollModifierText += effectString;
  rollModifier += effectBonus;

  let value, values, resultPrefix;
  if (scope['~checkAdvantage']?.value === 1) {
    logName += ' (Advantage)';
    const [a, b] = rollDice(2, 20);
    if (a >= b) {
      value = a;
      resultPrefix = `1d20 [ ${a}, ~~${b}~~ ] ${rollModifierText} = `;
    } else {
      value = b;
      resultPrefix = `1d20 [ ~~${a}~~, ${b} ] ${rollModifierText} = `;
    }
  } else if (scope['~checkAdvantage']?.value === -1) {
    logName += ' (Disadvantage)';
    const [a, b] = rollDice(2, 20);
    if (a <= b) {
      value = a;
      resultPrefix = `1d20 [ ${a}, ~~${b}~~ ] ${rollModifierText} = `;
    } else {
      value = b;
      resultPrefix = `1d20 [ ~~${a}~~, ${b} ] ${rollModifierText} = `;
    }
  } else {
    values = rollDice(1, 20);
    value = values[0];
    resultPrefix = `1d20 [ ${value} ] ${rollModifierText} = `
  }
  const result = (value + rollModifier) || 0;
  scope['~checkDiceRoll'] = { value };
  scope['~checkRoll'] = { value: result };
  scope['~checkModifier'] = { value: rollModifier };
  actionContext.addLog({
    name: logName,
    value: `${resultPrefix} **${result}**`,
  });
}

export function applyUnresolvedEffects(prop, scope) {
  let effectBonus = 0;
  let effectString = '';
  if (!prop.effects) {
    return { effectBonus, effectString };
  }
  prop.effects.forEach(effect => {
    if (!effect.amount?.parseNode) return;
    if (effect.operation !== 'add') return;
    effect.amount._parseLevel = 'reduce';
    evaluateCalculation(effect.amount, scope);
    if (typeof effect.amount?.value !== 'number') return;
    effectBonus += effect.amount.value;
    effectString += ` ${effect.amount.value < 0 ? '-' : '+'} [${effect.amount.calculation}] ${Math.abs(effect.amount.value)}`
  });
  return { effectBonus, effectString };
}
