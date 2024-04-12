import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertUserInTabletop } from './shared/tabletopPermissions';
import { assertUserHasPaidBenefits } from '/imports/api/users/patreon/tiers';
import Creatures from '/imports/api/creature/creatures/Creatures';

const addCreaturesToTabletop = new ValidatedMethod({

  name: 'tabletops.addCreatures',

  validate: new SimpleSchema({
    creatureId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
    tabletopId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),

  mixins: [RateLimiterMixin],
  // @ts-expect-error Rate limit not defined
  rateLimit: {
    numRequests: 10,
    timeInterval: 5000,
  },

  run({ tabletopId, creatureIds }) {
    if (!this.userId) {
      throw new Meteor.Error('tabletops.addCreatures.denied',
        'You need to be logged in to remove a tabletop');
    }
    assertUserHasPaidBenefits(this.userId);
    assertUserInTabletop(tabletopId, this.userId);

    Creatures.update({
      _id: { $in: creatureIds },
      $or: [
        { writers: this.userId },
        { owner: this.userId },
      ],
    }, {
      $set: { tabletop: tabletopId },
    }, {
      multi: true,
    });
  },

});

export default addCreaturesToTabletop;
