import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';

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
    let result = damagePropertyWork({ property, operation, value });
    return result;
  },
});

export function damagePropertyWork({property, operation, value}){
  let damage, newValue;
  if (operation === 'set'){
    const total = property.total || 0;
    // Set represents what we want the value to be after damage
    // So we need the actual damage to get to that value
    damage = total - value;
    // Damage can't exceed total value
    if (damage > total) damage = total;
    // Damage must be positive
    if (damage < 0) damage = 0;
    newValue = property.total - damage;
  } else if (operation === 'increment'){
    let currentValue = property.value || 0;
    let currentDamage = property.damage || 0;
    let increment = value;
    // Can't increase damage above the remaining value
    if (increment > currentValue) increment = currentValue;
    // Can't decrease damage below zero
    if (-increment > currentDamage) increment = -currentDamage;
    damage = currentDamage + increment;
    newValue = property.total - damage;
  }

  // Write the results
  CreatureProperties.update(property._id, {
    $set: {damage, value: newValue, dirty: true}
  }, {
    selector: property
  });
  return damage;
}

export default damageProperty;
