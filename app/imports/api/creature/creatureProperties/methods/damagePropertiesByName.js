import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import Creatures from '/imports/api/creature/Creatures.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import { damagePropertyWork } from '/imports/api/creature/creatureProperties/methods/damageProperty.js';
import { recomputePropertyDependencies } from '/imports/api/creature/computation/methods/recomputeCreature.js';

const damagePropertiesByName = new ValidatedMethod({
  name: 'CreatureProperties.damagePropertiesByName',
  validate: new SimpleSchema({
    creatureId: SimpleSchema.RegEx.Id,
    variableName: {
      type: String,
    },
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
  run({creatureId, variableName, operation, value}) {
		// Check permissions
    let creature = Creatures.findOne(creatureId, {
      fields: {
        damageMultipliers: 1,
        owner: 1,
        readers: 1,
        writers: 1,
      },
    });
    assertEditPermission(creature, this.userId);
    let lastProperty;
    CreatureProperties.find({
      'ancestors.id': creatureId,
      variableName,
      removed: {$ne: false},
      inactive: {$ne: true},
    }).forEach(property => {
      // Check if property can take damage
      let schema = CreatureProperties.simpleSchema(property);
      if (!schema.allowsKey('damage')) return;
      // Damage the property
      damagePropertyWork({property, operation, value});
      lastProperty = property;
    });
    if (lastProperty) recomputePropertyDependencies(lastProperty);
  }
});

export default damagePropertiesByName;
