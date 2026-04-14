import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import Libraries, { removeLibaryWork } from '/imports/api/library/Libraries';
import Creatures from '/imports/api/creature/creatures/Creatures';
import { removeCreatureWork } from '/imports/api/creature/creatures/methods/removeCreature';

Meteor.users.deleteMyAccount = new ValidatedMethod({
  name: 'users.deleteMyAccount',
  validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 1,
    timeInterval: 5000,
  },
  async run() {
    const userId = Meteor.userId();
    if (!userId) throw new Meteor.Error('No user',
      'You must be logged in to delete your account');

    // Delete all creatures
    const creatures = await Creatures.find({ owner: userId }, { fields: { _id: 1 } }).fetchAsync();
    for (const creature of creatures) {
      await removeCreatureWork(creature._id);
    }

    // Remove permissions from all creatures
    await Creatures.updateAsync({
      $or: [
        { writers: userId },
        { readers: userId },
      ],
    }, {
      $pull: {
        writers: userId,
        readers: userId
      },
    }, {
      multi: true,
    });

    // Delete all libraries
    const libraries = await Libraries.find({ owner: userId }, { fields: { _id: 1 } }).fetchAsync();
    for (const library of libraries) {
      await removeLibaryWork(library._id);
    }

    // Remove permissions from all libraries
    await Libraries.updateAsync({
      $or: [
        { writers: userId },
        { readers: userId },
      ],
    }, {
      $pull: {
        writers: userId,
        readers: userId
      },
    }, {
      multi: true,
    });

    // delete the account
    await Meteor.users.removeAsync(userId);
  }
});
