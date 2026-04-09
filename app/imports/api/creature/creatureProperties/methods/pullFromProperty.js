import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor';

const pullFromProperty = new ValidatedMethod({
  name: 'creatureProperties.pull',
  validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ _id, path, itemId }) {
    // Permissions
    let property = await CreatureProperties.findOneAsync(_id);
    let rootCreature = getRootCreatureAncestor(property);
    await assertEditPermission(rootCreature, this.userId);

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
