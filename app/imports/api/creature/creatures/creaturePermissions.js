import Creatures from '/imports/api/creature/creatures/Creatures';
import {
  assertEditPermission as editPermission,
  assertViewPermission as viewPermission,
  assertOwnership as ownership
} from '/imports/api/sharing/sharingPermissions';

function getCreature(creature, fields) {
  if (typeof creature === 'string') {
    return Creatures.findOne(creature, { fields });
  } else {
    return creature;
  }
}

export function assertOwnership(creature, userId) {
  creature = getCreature(creature, { owner: 1 });
  ownership(creature, userId);
}

export function assertEditPermission(creature, userId) {
  creature = getCreature(creature, { owner: 1, writers: 1 });
  editPermission(creature, userId);
}

export function assertViewPermission(creature, userId) {
  creature = getCreature(creature, { owner: 1, readers: 1, writers: 1, public: 1 });
  viewPermission(creature, userId);
}
