import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor';
import { get } from 'lodash';

const pushToProperty = new ValidatedMethod({
  name: 'creatureProperties.push',
  validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ _id, path, value }) {
    // Permissions
    const property = await CreatureProperties.findOneAsync(_id);
    const rootCreature = getRootCreatureAncestor(property);
    await assertEditPermission(rootCreature, this.userId);

    const joinedPath = path.join('.');

    // Respect maxCount
    const schema = CreatureProperties.simpleSchema(property);
    const maxCount = schema.get(joinedPath, 'maxCount');

    if (Number.isFinite(maxCount)) {
      const array = get(property, path);
      const currentCount = array ? array.length : 0;
      if (currentCount >= maxCount) {
        throw new Meteor.Error(
          'Array is full',
          `Cannot have more than ${maxCount} values`
        );
      }
    }

    // Do work
    await CreatureProperties.updateAsync(_id, {
      $push: { [joinedPath]: value },
      $set: { dirty: true },
    }, {
      selector: { type: property.type },
    });
  }
});

export default pushToProperty;
