import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import { applyTriggers } from '/imports/api/engine/actions/applyTriggers.js';
import ActionContext from '/imports/api/engine/actions/ActionContext.js';

const damageProperty = new ValidatedMethod({
  name: 'creatureProperties.damage',
  validate: new SimpleSchema({
    _id: SimpleSchema.RegEx.Id,
    operation: {
      type: String,
      allowedValues: ['set', 'increment']
    },
    value: Number,
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 20,
    timeInterval: 5000,
  },
  run({ _id, operation, value }) {

    // Get action context
    let prop = CreatureProperties.findOne(_id);
    if (!prop) throw new Meteor.Error(
      'Damage property failed', 'Property doesn\'t exist'
    );
    const creatureId = prop.ancestors[0].id;
    const actionContext = new ActionContext(creatureId, [creatureId], this);

    // Check permissions
    assertEditPermission(actionContext.creature, this.userId);

    // Check if property can take damage
    let schema = CreatureProperties.simpleSchema(prop);
    if (!schema.allowsKey('damage')) {
      throw new Meteor.Error(
        'Damage property failed',
        `Property of type "${prop.type}" can't be damaged`
      );
    }

    // Replace the prop by its actionContext counterpart if possible
    if (prop.variableName) {
      const actionContextProp = actionContext.scope[prop.variableName];
      if (actionContextProp?._id === prop._id) {
        prop = actionContextProp;
      }
    }

    const result = damagePropertyWork({ prop, operation, value, actionContext });

    // Insert the log
    actionContext.writeLog();
    return result;
  },
});

export function damagePropertyWork({ prop, operation, value, actionContext, logFunction }) {

  // Save the value to the scope before applying the before triggers
  if (operation === 'increment') {
    if (value >= 0) {
      actionContext.scope['~damage'] = { value };
    } else {
      actionContext.scope['~healing'] = { value: -value };
    }
  } else {
    actionContext.scope['~set'] = { value };
  }

  applyTriggers(actionContext.triggers?.damageProperty?.before, prop, actionContext);

  // fetch the value from the scope after the before triggers, in case they changed them
  if (operation === 'increment') {
    if (value >= 0) {
      value = actionContext.scope['~damage']?.value;
    } else {
      value = -actionContext.scope['~healing']?.value;
    }
  } else {
    value = actionContext.scope['~set']?.value;
  }

  let damage, newValue, increment;
  if (operation === 'set') {
    const total = prop.total || 0;
    // Set represents what we want the value to be after damage
    // So we need the actual damage to get to that value
    damage = total - value;
    // Damage can't exceed total value
    if (damage > total && !prop.ignoreLowerLimit) damage = total;
    // Damage must be positive
    if (damage < 0 && !prop.ignoreUpperLimit) damage = 0;
    newValue = prop.total - damage;
    // Write the results
    CreatureProperties.update(prop._id, {
      $set: { damage, value: newValue, dirty: true }
    }, {
      selector: prop
    });
    // Also write it straight to the prop so that it is updated in the actionContext
    prop.damage = damage;
    prop.value = newValue;
    logFunction?.(newValue);
  } else if (operation === 'increment') {
    let currentValue = prop.value || 0;
    let currentDamage = prop.damage || 0;
    increment = value;
    // Can't increase damage above the remaining value
    if (increment > currentValue && !prop.ignoreLowerLimit) increment = currentValue;
    // Can't decrease damage below zero
    if (-increment > currentDamage && !prop.ignoreUpperLimit) increment = -currentDamage;
    damage = currentDamage + increment;
    newValue = prop.total - damage;
    // Write the results
    CreatureProperties.update(prop._id, {
      $inc: { damage: increment, value: -increment },
      $set: { dirty: true },
    }, {
      selector: prop
    });
    // Also write it straight to the prop so that it is updated in the actionContext
    prop.damage += increment;
    prop.value -= increment;
    logFunction?.(increment);
  }

  applyTriggers(actionContext.triggers?.damageProperty?.after, prop, actionContext);

  if (operation === 'set') {
    return damage;
  } else if (operation === 'increment') {
    return increment;
  }
}

export default damageProperty;
