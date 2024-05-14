import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import Tabletops from '../Tabletops';
import { assertUserHasPaidBenefits } from '/imports/api/users/patreon/tiers';
import { assertCanEditTabletop, assertUserIsTabletopOwner } from './shared/tabletopPermissions';

const updateTabletopSharing = new ValidatedMethod({

  name: 'tabletops.updateSharing',

  validate({ tabletopId, userId, role }) {
    if (!userId) return false;
    if (!tabletopId) return false;
    // Allowed fields
    const roles = [
      'owner',
      'gameMaster',
      'player',
      'spectator',
      'none',
    ];
    if (!roles.includes(role)) {
      throw new Meteor.Error('tabletops.updateSharing.denied',
        'Invalid role selected');
    }
  },

  mixins: [RateLimiterMixin],
  // @ts-expect-error Rate limit not defined
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },

  run({ tabletopId, userId, role }) {
    if (!this.userId) {
      throw new Meteor.Error('tabletops.update.denied',
        'You need to be logged in to update a tabletop');
    }
    const tabletop = Tabletops.findOne(tabletopId);
    assertUserHasPaidBenefits(this.userId);
    assertCanEditTabletop(tabletop, this.userId);

    if (role === 'owner') {
      assertUserIsTabletopOwner(tabletop, this.userId);
    }

    // Check that the new user exists
    if (Meteor.isServer) {
      const userToAdd = Meteor.users.findOne({ _id: userId }, { fields: { _id: 1 } });
      if (!userToAdd) {
        throw new Meteor.Error('User not found',
          'The user could not be found'
        );
      }
    }

    let update;
    switch (role) {
      case 'owner':
        update = {
          $set: { owner: userId },
          $addToSet: {
            gameMasters: this.userId,
          },
          $pull: {
            players: this.userId,
            spectators: this.userId,
          },
        };
        break;
      case 'gameMaster':
        update = {
          $addToSet: {
            gameMasters: userId,
          },
          $pull: {
            players: userId,
            spectators: userId,
          },
        };
        break;
      case 'player':
        update = {
          $addToSet: {
            players: userId,
          },
          $pull: {
            gameMasters: userId,
            spectators: userId,
          },
        };
        break;
      case 'spectator':
        update = {
          $addToSet: {
            spectators: userId,
          },
          $pull: {
            gameMasters: userId,
            players: userId,
          },
        };
        break;
      case 'none':
        update = {
          $pull: {
            gameMasters: userId,
            players: userId,
            spectators: userId,
          },
        };
        break;
    }
    if (!update) return;
    return Tabletops.update(tabletopId, update)
  },

});

export default updateTabletopSharing;
