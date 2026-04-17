import Creatures, { type Creature } from '/imports/api/creature/creatures/Creatures';
import {
  assertEditPermission as editPermission,
  assertViewPermission as viewPermission,
  assertOwnership as ownership
} from '/imports/api/sharing/sharingPermissions';

async function getCreatureAsync(creature: Creature | string, fields: Mongo.Options<Creature>['fields']) {
  if (typeof creature === 'string') {
    return Creatures.findOneAsync(creature, { fields });
  } else {
    return creature;
  }
}

export async function assertOwnership(creature: Creature | string, userId: string | undefined | null) {
  const creatureObj = await getCreatureAsync(creature, { owner: 1 });
  ownership(creatureObj, userId);
}

export async function assertEditPermission(creature: Creature | string, userId: string | undefined | null) {
  const creatureObj = await getCreatureAsync(creature, { owner: 1, writers: 1 });
  await editPermission(creatureObj, userId);
}

export async function assertViewPermission(creature: Creature | string, userId: string | undefined | null) {
  const creatureObj = await getCreatureAsync(creature, { owner: 1, readers: 1, writers: 1, public: 1 });
  await viewPermission(creatureObj, userId);
}
