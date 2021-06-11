import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertOwnership } from '/imports/api/sharing/sharingPermissions.js';
import Creatures from '/imports/api/creature/Creatures.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import CreatureLogs from '/imports/api/creature/log/CreatureLogs.js';
import Experiences from '/imports/api/creature/experience/Experiences.js';
import ArchivedCreatures from '/imports/api/creature/archive/ArchivedCreatures.js';

function restoreCreature(archiveId){
  // Get the archive
  const archivedCreature = ArchivedCreatures.findOne(archiveId);

  // Insert the creature sub documents
  // They still have their original _id's
  Creatures.insert(archivedCreature.creature);
  CreatureProperties.batchInsert(archivedCreature.properties);
  Experiences.batchInsert(archivedCreature.experiences);
  CreatureLogs.batchInsert(archivedCreature.logs);
  // Do not recompute. The creature was in a computed and ordered state when
  // we archived it, just restore everything as-is

  // Remove the archived creature
  ArchivedCreatures.remove(archiveId);

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
    for (let id in archiveIds){
      let archivedCreature = ArchivedCreatures.findOne(id, {
        fields: {owner: 1}
      });
      assertOwnership(archivedCreature, this.userId)
    }
    let creatureIds = [];
    for (let id in archiveIds){
      let creatureId = restoreCreature(id);
      creatureIds.push(creatureId);
    }
    return creatureIds;
  },
});

export default restoreCreatures;
