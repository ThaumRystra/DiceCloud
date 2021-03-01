import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import { recomputePropertyDependencies } from '/imports/api/creature/computation/methods/recomputeCreature.js';

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
  run({_id, operation, value}) {
    // Check permissions
		let property = CreatureProperties.findOne(_id);
    if (!property) throw new Meteor.Error(
      'Damage property failed', 'Property doesn\'t exist'
    );
    let rootCreature = getRootCreatureAncestor(property);
    assertEditPermission(rootCreature, this.userId);
		// Check if property can take damage
		let schema = CreatureProperties.simpleSchema(property);
		if (!schema.allowsKey('damage')){
			throw new Meteor.Error(
				'Damage property failed',
				`Property of type "${property.type}" can't be damaged`
			);
		}
		let result = damagePropertyWork({property, operation, value});
    // Dependencies can't be changed through damage, only recompute deps
    recomputePropertyDependencies(property);
    return result;
  },
});

export function damagePropertyWork({property, operation, value}){
  if (operation === 'set'){
    let currentValue = property.value;
    // Set represents what we want the value to be after damage
    // So we need the actual damage to get to that value
    let damage = currentValue - value;
    // Damage can't exceed total value
    if (damage > currentValue) damage = currentValue;
    // Damage must be positive
    if (damage < 0) damage = 0;
    CreatureProperties.update(property._id, {
      $set: {damage}
    }, {
      selector: property
    });
    return currentValue - damage;
  } else if (operation === 'increment'){
    let currentValue = property.value - (property.damage || 0);
    let currentDamage = property.damage;
    let increment = value;
    // Can't increase damage above the remaining value
    if (increment > currentValue) increment = currentValue;
    // Can't decrease damage below zero
    if (-increment > currentDamage) increment = -currentDamage;
    CreatureProperties.update(property._id, {
      $inc: {damage: increment}
    }, {
      selector: property
    });
    return increment;
  }
}

export default damageProperty;
