import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import Tabletops from '../Tabletops';
import { assertUserHasPaidBenefits } from '/imports/api/users/patreon/tiers';
import { assertUserIsTabletopOwner } from './shared/tabletopPermissions';
import Creatures from '/imports/api/creature/creatures/Creatures';

const removeTabletop = new ValidatedMethod({

  name: 'tabletops.remove',

  validate: new SimpleSchema({
    tabletopId: {
      type: String,
      max: 32,
    },
  }).validator(),

  mixins: [RateLimiterMixin],
  // @ts-expect-error Rate limit not defined
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
