import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import Tabletops from '../Tabletops';
import { assertUserHasPaidBenefits } from '/imports/api/users/patreon/tiers';
import { assertUserIsTabletopOwner } from './shared/tabletopPermissions';

const removeTabletop = new ValidatedMethod({

  name: 'tabletops.update',

  validate({ _id, path }) {
    if (!_id) return false;
    // Allowed fields
    let allowedFields = [
      'name',
      'description',
      'imageUrl',
    ];
    if (!allowedFields.includes(path[0])) {
      throw new Meteor.Error('tabletops.update.denied',
        'This field can\'t be updated using this method');
    }
  },

  mixins: [RateLimiterMixin],
  // @ts-expect-error Rate limit not defined
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },

  run({ _id, path, value }) {
    if (!this.userId) {
      throw new Meteor.Error('tabletops.remove.denied',
        'You need to be logged in to remove a tabletop');
    }
    assertUserHasPaidBenefits(this.userId);
    assertUserIsTabletopOwner(_id, this.userId);

    if (value === undefined || value === null) {
      Tabletops.update(_id, {
        $unset: { [path.join('.')]: 1 },
      });
    } else {
      Tabletops.update(_id, {
        $set: { [path.join('.')]: value },
      });
    }
  },

});

export default removeTabletop;
