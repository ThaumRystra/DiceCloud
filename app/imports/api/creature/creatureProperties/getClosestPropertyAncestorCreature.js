import Creatures from '/imports/api/creature/Creatures.js';
import getClosestPropertyAncestorCreatureId from '/imports/api/creature/creatureProperties/getClosestPropertyAncestorCreatureId.js';

export default function getClosestPropertyAncestorCreature(prop){
  let creatureId = getClosestPropertyAncestorCreatureId(prop);
  return Creatures.findOne(creatureId);
}
