import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import { insertPropertyWork } from '/imports/api/creature/creatureProperties/methods/insertProperty.js';

const duplicateProperty = new ValidatedMethod({
  name: 'creatureProperties.duplicate',
  validate: new SimpleSchema({
    _id: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    }
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({_id}) {
    let creatureProperty = CreatureProperties.findOne(_id);
    let rootCreature = getRootCreatureAncestor(creatureProperty);
    assertEditPermission(rootCreature, this.userId);
    insertPropertyWork({
      property: creatureProperty,
      creature: rootCreature,
    });
  },
});

export default duplicateProperty;
