import LibraryCollections from '/imports/api/library/LibraryCollections';
import Creatures, { type Creature } from '/imports/api/creature/creatures/Creatures';
import getUserLibraryIds from './getUserLibraryIds';
import { intersection, union } from 'lodash';

export default async function getCreatureLibraryIds(creature: Creature | string | undefined, userId: string) {
  if (!userId) return [];

  // Get the ids of libraries the user is permitted to view
  const userLibIds = await getUserLibraryIds(userId);
  if (!creature) return userLibIds;

  // If given a creature Id, get the creature document
  if (typeof creature === 'string') {
    creature = await Creatures.findOneAsync(creature, {
      fields: {
        allowedLibraries: 1,
        allowedLibraryCollections: 1,
      }
    });
    if (!creature) return userLibIds;
  }

  // If the creature does not restrict the libraries, let it use them all
  if (!creature.allowedLibraryCollections && !creature.allowedLibraries) {
    return userLibIds;
  }

  // Get the ids of the libraries that the creature allows
  const allowedCollections = creature.allowedLibraryCollections || [];
  let creatureLibIds = creature.allowedLibraries || [];
  await LibraryCollections.find({
    _id: { $in: allowedCollections }
  }, { fields: { libraries: 1 } }).forEachAsync(collection => {
    creatureLibIds = union(creatureLibIds, collection.libraries);
  });

  // return all the ids that the creature allows and the user can view
  return intersection(userLibIds, creatureLibIds);
}
