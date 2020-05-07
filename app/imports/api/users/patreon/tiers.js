import { findLast } from 'lodash';
import getEntitledCents from '/imports/api/users/patreon/getEntitledCents.js';

const TIERS = [
  {
    name: 'Commoner',
    minimumEntitledCents: 0,
    invites: 0,
    paidBenefits: false,
  }, {
    name: 'Dreamer',
    minimumEntitledCents: 100,
    invites: 0,
    paidBenefits: false,
  }, {
    name: 'Wanderer',
    minimumEntitledCents: 300,
    invites: 0,
    paidBenefits: false,
  }, {
    //cost per user $5
    name: 'Adventurer',
    minimumEntitledCents: 500,
    invites: 0,
    paidBenefits: true,
  }, {
    //cost per user $3.33
    name: 'Hero',
    minimumEntitledCents: 1000,
    invites: 2,
    paidBenefits: true,
  }, {
    //cost per user $3.333
    name: 'Legend',
    minimumEntitledCents: 2000,
    invites: 5,
    paidBenefits: true,
  }, {
    //cost per user $3.125
    name: 'Paragon',
    minimumEntitledCents: 5000,
    invites: 15,
    paidBenefits: true,
  },
];

const GUEST_TIER = {
  name: 'Companion',
  guest: true,
  invites: 0,
  paidBenefits: true,
}

export function getTierByEntitledCents(entitledCents = 0){
  return findLast(TIERS, tier => entitledCents >= tier.minimumEntitledCents);
}

export function getUserTier(user){
  if (!user) throw 'user must be provided';
  if (typeof user === 'string'){
    user = Meteor.users.findOne(user);
    if (!user) throw 'User not found';
  }
  const entitledCents = getEntitledCents(user);
  return getTierByEntitledCents(entitledCents);
}

export default TIERS;
export { GUEST_TIER };
