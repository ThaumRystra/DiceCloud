import { findLast } from 'lodash';
import getEntitledCents from '/imports/api/users/patreon/getEntitledCents';
import Invites, { type Invite } from '/imports/api/users/Invites';
const patreonDisabled = !!Meteor.settings?.public?.disablePatreon;

const TIERS = Object.freeze([
  {
    name: 'Commoner',
    minimumEntitledCents: 0,
    invites: 0,
    characterSlots: 5,
    tabletopSlots: 0,
    fileStorage: 50,
    paidBenefits: false,
  }, {
    name: 'Dreamer',
    minimumEntitledCents: 100,
    invites: 0,
    characterSlots: 5,
    tabletopSlots: 0,
    fileStorage: 50,
    paidBenefits: false,
  }, {
    name: 'Wanderer',
    minimumEntitledCents: 300,
    invites: 0,
    characterSlots: 5,
    tabletopSlots: 0,
    fileStorage: 50,
    paidBenefits: false,
  }, {
    //cost per user $5
    name: 'Adventurer',
    minimumEntitledCents: 500,
    invites: 0,
    characterSlots: 20,
    tabletopSlots: 4,
    fileStorage: 200,
    paidBenefits: true,
  }, {
    //cost per user $3.33
    name: 'Hero',
    minimumEntitledCents: 1000,
    invites: 2,
    characterSlots: 50,
    tabletopSlots: 10,
    fileStorage: 500,
    paidBenefits: true,
  }, {
    //cost per user $3.333
    name: 'Legend',
    minimumEntitledCents: 2000,
    invites: 5,
    characterSlots: 120,
    tabletopSlots: 24,
    fileStorage: 1000,
    paidBenefits: true,
  }, {
    //cost per user $3.125
    name: 'Paragon',
    minimumEntitledCents: 5000,
    invites: 15,
    characterSlots: -1, // Unlimited characters
    tabletopSlots: -1, // Unlimited tabletops
    fileStorage: 2000,
    paidBenefits: true,
  },
]);

// Companion tier should be equivalent to the Adventurer tier
const GUEST_TIER = Object.freeze({
  name: 'Companion',
  guest: true,
  invites: 0,
  characterSlots: 20,
  tabletopSlots: 4,
  fileStorage: 200,
  paidBenefits: true,
});

// When patreon features are disabled, give all the users the same tier
// with no limitations
const PATREON_DISABLED_TIER = Object.freeze({
  name: 'Outlander',
  invites: 0,
  characterSlots: -1, // Can have infinitely many characters
  tabletopSlots: -1, // Infinite tabletops
  fileStorage: 1000000, // 1TB file storage
  paidBenefits: true,
});

export function getTierByEntitledCents(entitledCents = 0) {
  if (patreonDisabled) return PATREON_DISABLED_TIER;
  return findLast(TIERS, tier => entitledCents >= tier.minimumEntitledCents) || TIERS[0];
}

export async function getUserTierAsync(user: Meteor.User | string) {
  if (!user) throw new Error('user must be provided');
  if (typeof user === 'string') {
    const foundUser = await Meteor.users.findOneAsync(user, {
      fields: {
        'services.patreon': 1,
      }
    });
    if (!foundUser) throw new Meteor.Error('not-found', 'User not found');
    user = foundUser;
  }
  if (patreonDisabled) return PATREON_DISABLED_TIER;
  const entitledCents = getEntitledCents(user);
  const tier = getTierByEntitledCents(entitledCents);
  if (tier.paidBenefits) return tier;
  const invite = await Invites.findOneAsync({ invitee: user._id, isFunded: true });
  if (invite) {
    return GUEST_TIER;
  } else {
    return tier;
  }
}

export async function assertUserHasPaidBenefits(user: Meteor.User) {
  const tier = await getUserTierAsync(user);
  if (!tier.paidBenefits) {
    throw new Meteor.Error('no paid benefits',
      `The ${tier.name} tier does not have the required benefits`);
  }
}

if (Meteor.isServer) {
  Accounts.onLogin(function ({ user }: { user: Meteor.User }) {
    alignInvitesWithPatreonTier(user).catch((e) => {
      console.error(e);
    });
  });
}

async function alignInvitesWithPatreonTier(user: Meteor.User | undefined) {
  if (!user) return;
  const tier = await getUserTierAsync(user);
  const availableInvites = tier.invites;
  const currentlyFundedInvites: Invite[] = [];
  const currenltyUnfundedInvites: Invite[] = [];
  await Invites.find({
    inviter: user._id
  }).forEachAsync(invite => {
    if (invite.isFunded) {
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
  while (currentlyFundedInvites.length > availableInvites) {
    const inviteToDefund = currentlyFundedInvites.pop();
    if (!inviteToDefund) break;
    if (inviteToDefund.invitee) {
      await Invites.updateAsync(inviteToDefund._id, { $set: { isFunded: false } });
    } else {
      await Invites.removeAsync(inviteToDefund._id);
    }
  }
  // Fund unfunded invites or insert new ones
  while (currentlyFundedInvites.length < availableInvites) {
    if (currenltyUnfundedInvites.length) {
      const inviteToFund = currenltyUnfundedInvites.pop();
      if (!inviteToFund) break;
      currentlyFundedInvites.push(inviteToFund);
      await Invites.updateAsync(inviteToFund._id, { $set: { isFunded: true } });
    } else {
      const inviteId = await Invites.insertAsync({ inviter: user._id, isFunded: true });
      currentlyFundedInvites.push({ _id: inviteId, inviter: user._id, isFunded: true });
    }
  }
}

export default TIERS;
export { GUEST_TIER };
