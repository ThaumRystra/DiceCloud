import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import Creatures from '/imports/api/creature/creatures/Creatures';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';

const updateCreature = new ValidatedMethod({
  name: 'creatures.update',
  validate({ _id, path }) {
    if (!_id) return false;
    // Allowed fields
    let allowedFields = [
      'name',
      'alignment',
      'gender',
      'picture',
      'avatarPicture',
      'color',
      'settings',
    ];
    if (!allowedFields.includes(path[0])) {
      throw new Meteor.Error('Creatures.methods.update.denied',
        'This field can\'t be updated using this method');
    }
  },
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ _id, path, value }) {
    let creature = await Creatures.findOneAsync(_id);
    await assertEditPermission(creature, this.userId);
    if (value === undefined || value === null) {
      await Creatures.updateAsync(_id, {
        $unset: { [path.join('.')]: 1 },
      });
    } else {
      await Creatures.updateAsync(_id, {
        $set: { [path.join('.')]: value },
      });
    }
  },
});

export default updateCreature;
