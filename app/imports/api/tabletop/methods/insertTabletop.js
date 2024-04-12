import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import Tabletops from '../Tabletops';
import { assertUserHasPaidBenefits, getUserTier } from '/imports/api/users/patreon/tiers';

const insertTabletop = new ValidatedMethod({

  name: 'tabletops.insert',

  validate: null,

  mixins: [RateLimiterMixin],
  // @ts-expect-error Rate limit not defined
  rateLimit: {
    numRequests: 2,
    timeInterval: 5000,
  },

  run() {
    if (!this.userId) {
      throw new Meteor.Error('tabletops.insert.denied',
        'You need to be logged in to insert a tabletop');
    }
    assertUserHasPaidBenefits(this.userId);
    let tier = getUserTier(this.userId);
    const currentTabletopCount = Tabletops.find({ owner: this.userId }).count();

    if (tier.tabletopSlots !== -1 && tier.tabletopSlots <= currentTabletopCount) {
      throw new Meteor.Error('limit-reached', 'You have reached your maximum number of tabletops');
    }

    return Tabletops.insert({
      owner: this.userId,
      gameMasters: [this.userId],
      players: [],
      spectators: [],
      initiative: {
        active: false,
        roundNumber: 0,
      },
    });
  },
});

export default insertTabletop;
