import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { assertDocEditPermission, assertDocExists } from '/imports/api/sharing/sharingPermissions';
import { softRemove } from '/imports/api/parenting/softRemove';

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
  async run({ _id }: { _id: string }) {
    // Permissions
    const property = await CreatureProperties.findOneAsync(_id);
    assertDocExists(property);
    await assertDocEditPermission(property, this.userId);

    // Do work
    return await softRemove(CreatureProperties, property);
  }
});

export default softRemoveProperty;
