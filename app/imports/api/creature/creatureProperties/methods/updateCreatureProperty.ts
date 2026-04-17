import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { assertDocEditPermission, assertDocExists } from '/imports/api/sharing/sharingPermissions';

const updateCreatureProperty = new ValidatedMethod<{
  _id: string,
  path: string[],
  value: unknown,
}, Promise<number>>({
  name: 'creatureProperties.update',
  validate({ _id, path }) {
    if (!_id) throw new Meteor.Error('No _id', '_id is required');
    // We cannot change these fields with a simple update
    switch (path[0]) {
      case 'type':
      case 'root':
      case 'left':
      case 'right':
      case 'parentId':
        throw new Meteor.Error('Permission denied',
          'This property can\'t be updated directly');
    }
  },
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 12,
    timeInterval: 5000,
  },
  async run({ _id, path, value }) {
    // Permission
    const property = await CreatureProperties.findOneAsync(_id, {
      fields: { type: 1, root: 1 }
    });
    assertDocExists(property);
    await assertDocEditPermission(property, this.userId);

    const pathString = path.join('.');
    let modifier;
    // unset empty values
    if (value === null || value === undefined) {
      modifier = { $unset: { [pathString]: 1 }, $set: { dirty: true } };
    } else {
      modifier = { $set: { [pathString]: value, dirty: true } };
    }
    return await CreatureProperties.updateAsync(_id, modifier, {
      selector: { type: property.type },
    });
  },
});

export default updateCreatureProperty;
