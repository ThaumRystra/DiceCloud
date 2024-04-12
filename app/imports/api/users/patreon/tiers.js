import { findLast } from 'lodash';
import getEntitledCents from '/imports/api/users/patreon/getEntitledCents';
import Invites from '/imports/api/users/Invites';
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

export function getUserTier(user) {
  if (!user) throw 'user must be provided';
  if (typeof user === 'string') {
    user = Meteor.users.findOne(user, {
      fields: {
        'services.patreon': 1,
      }
    });
    if (!user) throw 'User not found';
  }
  if (patreonDisabled) return PATREON_DISABLED_TIER;
  const entitledCents = getEntitledCents(user);
  const tier = getTierByEntitledCents(entitledCents);
  if (tier.paidBenefits) return tier;
  let invite = Invites.findOne({ invitee: user._id, isFunded: true });
  if (invite) {
    return GUEST_TIER;
  } else {
    return tier;
  }
}

export function assertUserHasPaidBenefits(user) {
  let tier = getUserTier(user);
  if (!tier.paidBenefits) {
    throw new Meteor.Error('no paid benefits',
      `The ${tier.name} tier does not have the required benefits`);
  }
}

export default TIERS;
export { GUEST_TIER };
