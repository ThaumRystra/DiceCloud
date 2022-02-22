import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertOwnership } from '/imports/api/sharing/sharingPermissions.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import CreatureLogs from '/imports/api/creature/log/CreatureLogs.js';
import Experiences from '/imports/api/creature/experience/Experiences.js';
import ArchivedCreatures from '/imports/api/creature/archive/ArchivedCreatures.js';
import { removeCreatureWork } from '/imports/api/creature/creatures/methods/removeCreature.js';

export function restoreCreature(archiveId){
  // Get the archive
  const archivedCreature = ArchivedCreatures.findOne(archiveId);

  // Insert the creature sub documents
  // They still have their original _id's
  Creatures.insert(archivedCreature.creature);
  try {
    // Add all the properties
    if (archivedCreature.properties && archivedCreature.properties.length){
      CreatureProperties.batchInsert(archivedCreature.properties);
    }
    if (archivedCreature.experiences && archivedCreature.experiences.length){
      Experiences.batchInsert(archivedCreature.experiences);
    }
    if (archivedCreature.logs && archivedCreature.logs.length){
      CreatureLogs.batchInsert(archivedCreature.logs);
    }
    // Remove the archived creature
    ArchivedCreatures.remove(archiveId);
  } catch (e) {
    // If the above fails, delete the inserted creature
    removeCreatureWork(archivedCreature.creature._id);
    throw e;
  }

  // Do not recompute. The creature was in a computed and ordered state when
  // we archived it, just restore everything as-is

  return archivedCreature.creature._id;
}

const restoreCreatures = new ValidatedMethod({
  name: 'Creatures.methods.restoreCreatures',
  validate: new SimpleSchema({
    archiveIds: {
      type: Array,
      max: 10,
    },
    'archiveIds.$': {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 1,
    timeInterval: 5000,
  },
  run({archiveIds}) {
    for (let id of archiveIds){
      let archivedCreature = ArchivedCreatures.findOne(id, {
        fields: {owner: 1}
      });
      assertOwnership(archivedCreature, this.userId)
    }
    let creatureIds = [];
    for (let id of archiveIds){
      let creatureId = restoreCreature(id);
      creatureIds.push(creatureId);
    }
    return creatureIds;
  },
});

export default restoreCreatures;
