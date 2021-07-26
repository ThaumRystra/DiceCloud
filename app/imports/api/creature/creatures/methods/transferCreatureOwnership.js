import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import { assertOwnership } from '/imports/api/creature/creatures/creaturePermissions.js';
import { getUserTier } from '/imports/api/users/patreon/tiers.js';

const transferCreatureOwnership = new ValidatedMethod({

  name: 'creatures.methods.transferOwnership',

  validate: new SimpleSchema({
    creatureId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
    userId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),

  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },

  run({creatureId, userId}) {
    assertOwnership(creatureId, this.userId);

    let tier = getUserTier(userId);
    let currentCharacterCount = Creatures.find({
      owner: userId,
    }, {
      fields: {_id: 1},
    }).count();

    if (
      tier.characterSlots !== -1 &&
      currentCharacterCount >= tier.characterSlots
    ){
      throw new Meteor.Error('Creatures.methods.transferOwnership.denied',
      'The new owner is already at their character limit')
    }

    Creatures.update(creatureId, {
      $set: {owner: userId},
    });

		return creatureId;
  },
});

export default transferCreatureOwnership;
