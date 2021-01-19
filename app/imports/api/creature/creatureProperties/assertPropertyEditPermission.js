import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import getClosestPropertyAncestorCreature from '/imports/api/creature/creatureProperties/getClosestPropertyAncestorCreature.js';

export default function assertPropertyEditPermission(prop, userId){
  let creature = getClosestPropertyAncestorCreature(prop);
  assertEditPermission(creature, userId);
}
