import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import Tabletops from '../Tabletops.js';
import { assertAdmin } from '/imports/api/sharing/sharingPermissions.js';
import { assertUserHasPaidBenefits } from '/imports/api/users/patreon/tiers.js';

const insertTabletop = new ValidatedMethod({

  name: 'tabletops.insert',

  validate: null,

  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },

  run() {
    if (!this.userId) {
      throw new Meteor.Error('tabletops.insert.denied',
        'You need to be logged in to insert a tabletop');
    }
    assertUserHasPaidBenefits(this.userId);
    assertAdmin(this.userId);

    return Tabletops.insert({
      gameMaster: this.userId,
    });
  },

});

export default insertTabletop;
