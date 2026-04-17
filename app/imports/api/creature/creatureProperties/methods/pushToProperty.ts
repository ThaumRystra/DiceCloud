import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { assertDocEditPermission, assertDocExists } from '/imports/api/sharing/sharingPermissions';
import { get } from 'lodash';

const pushToProperty = new ValidatedMethod({
  name: 'creatureProperties.push',
  validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ _id, path, value }: { _id: string, path: string[], value: unknown }) {
    // Permissions
    const property = await CreatureProperties.findOneAsync(_id);
    assertDocExists(property);
    await assertDocEditPermission(property, this.userId);

    const joinedPath = path.join('.');

    // Respect maxCount
    const schema = CreatureProperties.simpleSchema(property);
    const maxCount = schema.get(joinedPath, 'maxCount') as number;

    if (Number.isFinite(maxCount)) {
      const array = get(property, path) as unknown;
      if (array !== undefined && !Array.isArray(array)) {
        throw new Meteor.Error('invalid-path', 'The path does not lead to an array on the property');
      }
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
