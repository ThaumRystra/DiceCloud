import { getUserTierAsync } from '/imports/api/users/patreon/tiers';
import Creatures from '/imports/api/creature/creatures/Creatures';

export default async function assertHasCharactersSlots(userId: string) {
  if (await characterSlotsRemainingAsync(userId) <= 0) {
    throw new Meteor.Error('characterSlotLimit',
      'No character slots left')
  }
}

export async function characterSlotsRemainingAsync(userId: string) {
  const tier = await getUserTierAsync(userId);
  const currentCharacterCount = await Creatures.find({
    owner: userId,
  }, {
    fields: { _id: 1 },
  }).countAsync();
  if (tier.characterSlots === -1) {
    return Number.POSITIVE_INFINITY;
  }
  return tier.characterSlots - currentCharacterCount;
}
