import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { TypedSimpleSchema, type InferType } from '/imports/api/utility/TypedSimpleSchema';

const InviteSchema = TypedSimpleSchema.from({
  _id: {
    type: String,
    max: 32,
  },
  inviter: {
    type: String,
    max: 32,
  },
  invitee: {
    type: String,
    max: 32,
    optional: true,
  },
  inviteToken: {
    type: String,
    optional: true,
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

export type Invite = InferType<typeof InviteSchema>;
const Invites = new Mongo.Collection<Invite>('invites');

const getInviteToken = new ValidatedMethod({
  name: 'invites.getToken',
  validate: TypedSimpleSchema.from({
    inviteId: {
      type: String,
      max: 32,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ inviteId }) {
    const invite = await Invites.findOneAsync(inviteId);
    if (!invite) {
      throw new Meteor.Error('invites.getToken.notFound',
        'No invite could be found for this id');
    }
    if (this.userId !== invite.inviter) {
      throw new Meteor.Error('invites.getToken.denied',
        'You need to be the inviter of the invite to create a token');
    }
    if (invite.inviteToken) {
      return invite.inviteToken;
    } else {
      const inviteToken = Random.id(5);
      await Invites.updateAsync(inviteId, { $set: { inviteToken } })
      return inviteToken;
    }
  },
});

const acceptInviteToken = new ValidatedMethod({
  name: 'invites.acceptToken',
  validate: TypedSimpleSchema.from({
    inviteToken: {
      type: String,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ inviteToken }) {
    if (!this.userId) {
      throw new Meteor.Error('invites.acceptToken.denied',
        'You need to be the logged in to accept a token');
    }
    if (Meteor.isClient) return;
    const invite = await Invites.findOneAsync({ inviteToken });
    if (!invite) {
      throw new Meteor.Error('invites.acceptToken.notFound',
        'No invite could be found for this link, maybe it has already been claimed');
    }
    // If the invitee is already filled, fix unexpected case by deleting the token
    if (invite.invitee) {
      await Invites.updateAsync(invite._id, {
        $unset: { inviteToken: 1 }
      });
      throw new Meteor.Error('Invites.methods.acceptToken.alreadyAccepted',
        'This invite has already been claimed');
    }
    if (this.userId === invite.inviter) {
      throw new Meteor.Error('Invites.methods.acceptToken.ownToken',
        'You can\'t accept your own invite');
    }
    await Invites.updateAsync(invite._id, {
      $set: { invitee: this.userId },
      $unset: { inviteToken: 1 },
    });
  },
});

const revokeInvite = new ValidatedMethod({
  name: 'invites.revokeInvite',
  validate: TypedSimpleSchema.from({
    inviteId: {
      type: String,
      max: 32,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ inviteId }) {
    if (!this.userId) {
      throw new Meteor.Error('Invites.methods.revokeInvite.denied',
        'You need to be the logged in to revoke a token');
    }
    if (Meteor.isClient) return;
    const invite = await Invites.findOneAsync(inviteId);
    if (!invite) {
      throw new Meteor.Error('Invites.methods.revokeInvite.notFound',
        'No invite could be found for this id');
    }
    if (this.userId !== invite.inviter) {
      throw new Meteor.Error('Invites.methods.revokeInvite.denied',
        'You are not the owner of this invite');
    }

    // If the invitee is empty, the token has already been revoked
    if (!invite.invitee) {
      return;
    }
    await Invites.updateAsync(invite._id, {
      $unset: { invitee: 1, dateConfirmed: 1 },
    });
  },
});

Invites.attachSchema(InviteSchema);

export default Invites;
export { getInviteToken, acceptInviteToken, revokeInvite };
