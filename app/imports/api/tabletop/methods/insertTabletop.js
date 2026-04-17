import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import Tabletops from '../Tabletops';
import { assertUserHasPaidBenefits, getUserTierAsync } from '/imports/api/users/patreon/tiers';

const insertTabletop = new ValidatedMethod({

  name: 'tabletops.insert',

  validate: null,

  mixins: [RateLimiterMixin],
  // @ts-expect-error Rate limit not defined
  rateLimit: {
    numRequests: 2,
    timeInterval: 5000,
  },

  async run() {
    if (!this.userId) {
      throw new Meteor.Error('tabletops.insert.denied',
        'You need to be logged in to insert a tabletop');
    }
    await assertUserHasPaidBenefits(this.userId);
    const tier = getUserTierAsync(this.userId);
    const currentTabletopCount = await Tabletops.find({ owner: this.userId }).countAsync();

    if (tier.tabletopSlots !== -1 && tier.tabletopSlots <= currentTabletopCount) {
      throw new Meteor.Error('limit-reached', 'You have reached your maximum number of tabletops');
    }

    return Tabletops.insertAsync({
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
