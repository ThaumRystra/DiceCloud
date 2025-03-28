import { Meteor } from 'meteor/meteor';
import SCHEMA_VERSION from '/imports/constants/SCHEMA_VERSION';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertOwnership } from '/imports/api/creature/creatures/creaturePermissions';
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import CreatureLogs from '/imports/api/creature/log/CreatureLogs';
import Experiences from '/imports/api/creature/experience/Experiences';
import { removeCreatureWork } from '/imports/api/creature/creatures/methods/removeCreature';
import ArchiveCreatureFiles from '/imports/api/creature/archive/ArchiveCreatureFiles';
import { getFilter } from '/imports/api/parenting/parentingFunctions';

export function getArchiveObj(creatureId) {
  // Build the archive document
  const creature = Creatures.findOne(creatureId);
  if (!creature) throw new Meteor.Error('creature-not-found', 'Creature not found');
  const properties = CreatureProperties.find({ ...getFilter.descendantsOfRoot(creatureId) }).fetch();
  const experiences = Experiences.find({ creatureId }).fetch();
  const logs = CreatureLogs.find({ creatureId }).fetch();
  let archiveCreature = {
    meta: {
      type: 'DiceCloud V2 Creature Archive',
      schemaVersion: SCHEMA_VERSION,
      archiveDate: new Date(),
    },
    creature,
    properties,
    experiences,
    logs,
  };

  return archiveCreature;
}

export const archiveCreature = Meteor.wrapAsync(function archiveCreatureFn(creatureId, callback) {
  const archive = getArchiveObj(creatureId);
  const buffer = Buffer.from(JSON.stringify(archive, null, 2));
  ArchiveCreatureFiles.write(buffer, {
    fileName: `${archive.creature.name || archive.creature._id}.json`,
    type: 'application/json',
    userId: archive.creature.owner,
    meta: {
      schemaVersion: SCHEMA_VERSION,
      creatureId: archive.creature._id,
      creatureName: archive.creature.name,
    },
  }, (error, fileRef) => {
    if (error) {
      // If there is an error already, just call the callback
      callback(error);
    } else if (!Meteor.settings.useS3) {
      // If we aren't using s3, remove the creature and call the callback
      removeCreatureWork(creatureId);
      callback();
    } else {
      // Wait for s3Result event that occurs when the s3 attempt to write ends.
      // If it's successful, remove the creature, otherwise callback with error
      const resultHandler = (s3Error, resultRef) => {
        // This event is for a different file, ignore it
        if (resultRef._id !== fileRef._id) return;
        // Remove this handler, we are only running it once for this fileId
        ArchiveCreatureFiles.off('s3Result', resultHandler);
        // Remove the creature if there was no error
        if (!s3Error) {
          removeCreatureWork(creatureId);
        }
        // Alert the callback that we're done
        callback(s3Error);
      }
      ArchiveCreatureFiles.on('s3Result', resultHandler);
    }
  }, true);
});

const archiveCreatureToFile = new ValidatedMethod({
  name: 'Creatures.methods.archiveCreatureToFile',
  validate: new SimpleSchema({
    'creatureId': {
      type: String,
      max: 32,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 10,
    timeInterval: 5000,
  },
  async run({ creatureId }) {
    assertOwnership(creatureId, this.userId);
    if (Meteor.isServer) {
      archiveCreature(creatureId);
    } else {
      removeCreatureWork(creatureId);
    }
  },
});

export default archiveCreatureToFile;
