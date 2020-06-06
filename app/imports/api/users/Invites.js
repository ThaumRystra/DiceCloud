import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { getUserTier } from '/imports/api/users/patreon/tiers.js';

let Invites= new Mongo.Collection('invites');

let InviteSchema = new SimpleSchema({
  inviter: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1,
  },
  invitee: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
    index: 1,
    unique: 1,
  },
  inviteToken: {
    type: String,
    optional: true,
    index: 1,
    unique: 1,
  },
  isFunded: {
    type: Boolean,
  },
  // The timestamp of when the invitee was confirmed
  // Older invites have priority over newer ones
  dateConfirmed: {
    type: Date,
    optional: true,
  },
});

if (Meteor.isServer){
  Accounts.onLogin(function({user}){
    alignInvitesWithPatreonTier(user);
  });
}

function alignInvitesWithPatreonTier(user){
  const tier = getUserTier(user);
  let availableInvites = tier.invites;
  let currentlyFundedInvites = [];
  let currenltyUnfundedInvites = [];
  Invites.find({
    inviter: user._id
  }).forEach(invite => {
    if (invite.isFunded){
      currentlyFundedInvites.push(invite);
    } else {
      currenltyUnfundedInvites.push(invite);
    }
  });

  // Return early if no work needs doing to skip sorting
  if (currentlyFundedInvites.length === availableInvites) return;

  // Sort the invites by date forwards and backwards
  currentlyFundedInvites.sort((a, b) => a.dateConfirmed - b.dateConfirmed);
  currenltyUnfundedInvites.sort((a, b) => b.dateConfirmed - a.dateConfirmed);

  // Defund or delete excess invites
  while (currentlyFundedInvites.length > availableInvites){
    let inviteToDefund = currentlyFundedInvites.pop();
    if (inviteToDefund.invitee){
      Invites.update(inviteToDefund._id, {$set: {isFunded: false}});
    } else {
      Invites.remove(inviteToDefund._id);
    }
  }
  // Fund unfunded invites or insert new ones
  while (currentlyFundedInvites.length < availableInvites){
    if (currenltyUnfundedInvites.length){
      let inviteToFund = currenltyUnfundedInvites.pop();
      currentlyFundedInvites.push(inviteToFund);
      Invites.update(inviteToFund._id, {$set: {isFunded: true}});
    } else {
      let inviteId = Invites.insert({inviter: user._id, isFunded: true});
      currentlyFundedInvites.push({_id: inviteId});
    }
  }
}

const getInviteToken = new ValidatedMethod({
  name: 'invites.getToken',
  validate: new SimpleSchema({
    inviteId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({inviteId}) {
    let invite = Invites.findOne(inviteId);
    if (this.userId !== invite.inviter) {
      throw new Meteor.Error('Invites.methods.getToken.denied',
      'You need to be the inviter of the invite to create a token');
    }
    if (invite.inviteToken){
      return invite.inviteToken;
    } else {
      let inviteToken = Random.id(5);
      Invites.update(inviteId, {$set: {inviteToken}})
      return inviteToken;
    }
  },
});

const acceptInviteToken = new ValidatedMethod({
  name: 'invites.acceptToken',
  validate: new SimpleSchema({
    inviteToken: {
      type: String,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({inviteToken}) {
    if (!this.userId) {
      throw new Meteor.Error('Invites.methods.acceptToken.denied',
      'You need to be the logged in to accept a token');
    }
    if (Meteor.isClient) return;
    let invite = Invites.findOne({inviteToken});
    if (!invite){
      throw new Meteor.Error('Invites.methods.acceptToken.notFound',
      'No invite could be found for this link, maybe it has already been claimed');
    }
    // If the invitee is already filled, fix unexpected case by deleting the token
    if (invite.invitee){
      Invites.update(invite._id, {
        $unset: {inviteToken: 1}
      });
      throw new Meteor.Error('Invites.methods.acceptToken.alreadyAccepted',
      'This invite has already been claimed');
    }
    if (this.userId === invite.inviter){
      throw new Meteor.Error('Invites.methods.acceptToken.ownToken',
      'You can\'t accept your own invite');
    }
    Invites.update(invite._id, {
      $set: {invitee: this.userId},
      $unset: {inviteToken: 1},
    });
  },
});

const revokeInvite = new ValidatedMethod({
  name: 'invites.revokeInvite',
  validate: new SimpleSchema({
    inviteId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({inviteId}) {
    if (!this.userId) {
      throw new Meteor.Error('Invites.methods.revokeInvite.denied',
      'You need to be the logged in to revoke a token');
    }
    if (Meteor.isClient) return;
    let invite = Invites.findOne(inviteId);
    if (!invite){
      throw new Meteor.Error('Invites.methods.revokeInvite.notFound',
      'No invite could be found for this id');
    }
    if (this.userId !== invite.inviter) {
      throw new Meteor.Error('Invites.methods.revokeInvite.denied',
      'You are not the owner of this invite');
    }

    // If the invitee is empty, the token has already been revoked
    if (!invite.invitee){
      return;
    }
    Invites.update(invite._id, {
      $unset: {invitee: 1, dateConfirmed: 1},
    });
  },
});

Invites.attachSchema(InviteSchema);

export default Invites;
export { alignInvitesWithPatreonTier, getInviteToken, acceptInviteToken, revokeInvite };
