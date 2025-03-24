import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertUserInTabletop } from './shared/tabletopPermissions';
import { assertUserHasPaidBenefits } from '/imports/api/users/patreon/tiers';
import Creatures from '/imports/api/creature/creatures/Creatures';
import Tabletops from '/imports/api/tabletop/Tabletops';
import { assertTabletopHasPropSpace } from '/imports/api/tabletop/methods/shared/tabletopLimits';

const addCreaturesToTabletop = new ValidatedMethod({

  name: 'tabletops.addCreatures',

  validate: new SimpleSchema({
    'creatureIds': {
      type: Array,
      max: 20,
    },
    'creatureIds.$': {
      type: String,
      max: 32,
    },
    tabletopId: {
      type: String,
      max: 32,
    },
  }).validator(),

  mixins: [RateLimiterMixin],
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
    const tabletop = Tabletops.findOne(tabletopId);
    assertUserInTabletop(tabletop, this.userId);
    assertTabletopHasPropSpace(tabletop);

    Creatures.update({
      _id: { $in: creatureIds },
      // You must have write permission for the creatures you
      $or: [
        { writers: this.userId },
        { owner: this.userId },
      ],
    }, {
      $set: { tabletopId },
    }, {
      multi: true,
    });
  },

});

export default addCreaturesToTabletop;
