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
  run() {
    let userId = Meteor.userId();
    if (!userId) throw new Meteor.Error('No user',
      'You must be logged in to delete your account');

    // Delete all creatures
    let creatures = Creatures.find({ owner: userId }, { fields: { _id: 1 } }).fetch();
    creatures.forEach(creature => removeCreatureWork(creature._id));

    // Remove permissions from all creatures
    Creatures.update({
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
    let libraries = Libraries.find({ owner: userId }, { fields: { _id: 1 } }).fetch();
    libraries.forEach(library => removeLibaryWork(library._id));

    // Remove permissions from all creatures
    Libraries.update({
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
    Meteor.users.remove(userId);
  }
});
