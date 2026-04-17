import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { assertDocEditPermission, assertDocExists } from '/imports/api/sharing/sharingPermissions';

const pullFromProperty = new ValidatedMethod({
  name: 'creatureProperties.pull',
  validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ _id, path, itemId }: { _id: string, path: string[], itemId: string }) {
    // Permissions
    const property = await CreatureProperties.findOneAsync(_id);
    assertDocExists(property);
    await assertDocEditPermission(property, this.userId);

    // Do work
    await CreatureProperties.updateAsync(_id, {
      $pull: { [path.join('.')]: { _id: itemId } },
      $set: { dirty: true }
    }, {
      selector: { type: property.type },
      getAutoValues: false,
    });
  }
});

export default pullFromProperty;
