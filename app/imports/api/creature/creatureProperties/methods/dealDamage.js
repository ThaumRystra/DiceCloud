import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import Creatures from '/imports/api/creature/Creatures.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import { damagePropertyWork } from '/imports/api/creature/creatureProperties/methods/damageProperty.js';
import { recomputeCreatureByDependencies } from '/imports/api/creature/computation/methods/recomputeCreature.js';

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
        damageMultipliers: 1,
        owner: 1,
        readers: 1,
        writers: 1,
      },
    });
    assertEditPermission(creature, this.userId);

    // Get all the health bars and do damage to them
    let healthBars = CreatureProperties.find({
      'ancestors.id': creatureId,
      type: 'attribute',
      attributeType:'healthBar',
      removed: {$ne: true},
      inactive: {$ne: true},
    }, {
      sort: {order: -1},
    });
    let multiplier = creature.damageMultipliers[damageType];
    if (multiplier === undefined) multiplier = 1;
    let totalDamage = Math.floor(amount * multiplier);
    let damageLeft = totalDamage;
    if (damageType === 'healing') damageLeft = -totalDamage;
    let dependencies = [];
    healthBars.forEach(healthBar => {
      if (damageLeft === 0) return;
      let damageAdded = damagePropertyWork({
        property: healthBar,
        operation: 'increment',
        value: damageLeft,
      });
      damageLeft -= damageAdded;
      dependencies.push(healthBar.variableName);
      dependencies.push(...healthBar.dependencies);
    });
    recomputeCreatureByDependencies({creature, dependencies});
    return totalDamage;
  },
});

export default dealDamage;
