import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import { damagePropertyWork } from '/imports/api/creature/creatureProperties/methods/damageProperty.js';
import computeCreature from '/imports/api/engine/computeCreature.js';

const dealDamage = new ValidatedMethod({
  name: 'creatureProperties.dealDamage',
  validate: new SimpleSchema({
    creatureId: SimpleSchema.RegEx.Id,
    damageType: {
      type: String,
    },
    amount: Number,
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 20,
    timeInterval: 5000,
  },
  run({creatureId, damageType, amount}) {
    // permissions
    let creature = Creatures.findOne(creatureId, {
      fields: {
        owner: 1,
        readers: 1,
        writers: 1,
      },
    });
    assertEditPermission(creature, this.userId);

    const totalDamage = dealDamageWork({creature, damageType, amount})
    computeCreature(creatureId);
    return totalDamage;
  },
});

export function dealDamageWork({creature, damageType, amount}){
  console.log({damageType, amount})
  // Get all the health bars and do damage to them
  let healthBars = CreatureProperties.find({
    'ancestors.id': creature._id,
    type: 'attribute',
    attributeType:'healthBar',
    removed: {$ne: true},
    inactive: {$ne: true},
  }, {
    sort: {order: -1},
  });
  //let multiplier = creature.damageMultipliers[damageType];
  //if (multiplier === undefined) multiplier = 1;
  //let totalDamage = Math.floor(amount * multiplier);
  const totalDamage = amount;
  let damageLeft = totalDamage;
  if (damageType === 'healing') damageLeft = -totalDamage;
  let propertyIds = [];
  healthBars.forEach(healthBar => {
    if (damageLeft === 0) return;
    let damageAdded = damagePropertyWork({
      property: healthBar,
      operation: 'increment',
      value: damageLeft,
    });
    damageLeft -= damageAdded;
    propertyIds.push(healthBar._id);
  });
  return totalDamage;
}

export default dealDamage;
