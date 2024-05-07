import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import { softRemove } from '/imports/api/parenting/softRemove';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor';

const softRemoveProperty = new ValidatedMethod({
  name: 'creatureProperties.softRemove',
  validate: new SimpleSchema({
    _id: SimpleSchema.RegEx.Id
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({ _id }) {
    // Permissions
    let property = CreatureProperties.findOne(_id);
    let rootCreature = getRootCreatureAncestor(property);
    assertEditPermission(rootCreature, this.userId);

    // Do work
    softRemove(CreatureProperties, property);
  }
});

export default softRemoveProperty;
