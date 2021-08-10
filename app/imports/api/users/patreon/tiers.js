import { findLast } from 'lodash';
import getEntitledCents from '/imports/api/users/patreon/getEntitledCents.js';
import Invites from '/imports/api/users/Invites.js';
const patreonDisabled = !!Meteor.settings?.public?.disablePatreon;

const TIERS = Object.freeze([
  {
    name: 'Commoner',
    minimumEntitledCents: 0,
    invites: 0,
    characterSlots: 5,
    paidBenefits: false,
  }, {
    name: 'Dreamer',
    minimumEntitledCents: 100,
    invites: 0,
    characterSlots: 5,
    paidBenefits: false,
  }, {
    name: 'Wanderer',
    minimumEntitledCents: 300,
    invites: 0,
    characterSlots: 5,
    paidBenefits: false,
  }, {
    //cost per user $5
    name: 'Adventurer',
    minimumEntitledCents: 500,
    invites: 0,
    characterSlots: 20,
    paidBenefits: true,
  }, {
    //cost per user $3.33
    name: 'Hero',
    minimumEntitledCents: 1000,
    invites: 2,
    characterSlots: 50,
    paidBenefits: true,
  }, {
    //cost per user $3.333
    name: 'Legend',
    minimumEntitledCents: 2000,
    invites: 5,
    characterSlots: 120,
    paidBenefits: true,
  }, {
    //cost per user $3.125
    name: 'Paragon',
    minimumEntitledCents: 5000,
    invites: 15,
    characterSlots: -1, // Unlimited characters
    paidBenefits: true,
  },
]);

// Companion tier should be equivalent to the Adventurer tier
const GUEST_TIER = Object.freeze({
  name: 'Companion',
  guest: true,
  invites: 0,
  characterSlots: 20,
  paidBenefits: true,
});

// When patreon features are disabled, give all the users the same tier
// with no limitations
const PATREON_DISABLED_TIER = Object.freeze({
  name: 'Outlander',
  invites: 0,
  characterSlots: -1, // Can have infinitely many characters
  paidBenefits: true,
});

export function getTierByEntitledCents(entitledCents = 0){
  if (patreonDisabled) return PATREON_DISABLED_TIER;
  return findLast(TIERS, tier => entitledCents >= tier.minimumEntitledCents);
}

export function getUserTier(user){
  if (!user) throw 'user must be provided';
  if (typeof user === 'string'){
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
  let invite = Invites.findOne({invitee: user._id, isFunded: true});
  if (invite){
    return GUEST_TIER;
  } else {
    return tier;
  }
}

export function assertUserHasPaidBenefits(user){
  let tier = getUserTier(user);
  if (!tier.paidBenefits){
    throw new Meteor.Error('Creatures.methods.insert.denied',
    `The ${tier.name} tier does not allow you to insert a creature`);
  }
}

export default TIERS;
export { GUEST_TIER };
