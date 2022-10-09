import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import Tabletops from '../Tabletops.js';
import { assertAdmin } from '/imports/api/sharing/sharingPermissions.js';
import { assertUserHasPaidBenefits } from '/imports/api/users/patreon/tiers.js';
import { assertUserIsTabletopOwner } from './shared/tabletopPermissions.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';

const removeTabletop = new ValidatedMethod({

  name: 'tabletops.remove',

  validate: new SimpleSchema({
    tabletopId: {
      type: String,
      regEx: SimpleSchema.RegEx.id,
    },
  }).validator(),

  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },

  run({ tabletopId }) {
    if (!this.userId) {
      throw new Meteor.Error('tabletops.remove.denied',
        'You need to be logged in to remove a tabletop');
    }
    assertUserHasPaidBenefits(this.userId);
    assertUserIsTabletopOwner(tabletopId, this.userId);
    assertAdmin(this.userId);

    let removed = Tabletops.remove({
      _id: tabletopId,
    });
    Creatures.update({
      tabletop: tabletopId,
    }, {
      $unset: { tabletop: 1 },
    });
    return removed;
  },

});

export default removeTabletop;
