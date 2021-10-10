import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertUserInTabletop } from './shared/tabletopPermissions.js';
import { assertAdmin } from '/imports/api/sharing/sharingPermissions.js';
import { assertUserHasPaidBenefits } from '/imports/api/users/patreon/tiers.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';

const addCreaturesToTabletop = new ValidatedMethod({

  name: 'tabletops.addCreatures',

  validate: new SimpleSchema({
    'creatureIds': {
      type: Array,
    },
    'creatureIds.$': {
      type: String,
      regEx: SimpleSchema.RegEx.id,
    },
    tabletopId: {
      type: String,
      regEx: SimpleSchema.RegEx.id,
    },
  }).validator(),

  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 10,
    timeInterval: 5000,
  },

  run({tabletopId, creatureIds}) {
    if (!this.userId) {
      throw new Meteor.Error('tabletops.addCreatures.denied',
      'You need to be logged in to remove a tabletop');
    }
    assertUserHasPaidBenefits(this.userId);
    assertUserInTabletop(tabletopId, this.userId);
    assertAdmin(this.userId);

    Creatures.update({
      _id: {$in: creatureIds},
      $or: [
        {writers: this.userId},
        {owner: this.userId},
      ],
    }, {
      $set: {tabletop: tabletopId},
    }, {
      multi: true,
    });
  },

});

export default addCreaturesToTabletop;
