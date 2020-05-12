import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
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
  name: 'Invites.methods.getToken',
  validate: new SimpleSchema({
    inviteId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
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
  name: 'Invites.methods.acceptToken',
  validate: new SimpleSchema({
    inviteToken: {
      type: String,
    },
  }).validator(),
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

Invites.attachSchema(InviteSchema);

export default Invites;
export { alignInvitesWithPatreonTier, getInviteToken, acceptInviteToken };
