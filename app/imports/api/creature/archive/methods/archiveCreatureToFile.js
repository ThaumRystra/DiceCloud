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

export async function getArchiveObj(creatureId) {
  // Build the archive document
  const creature = await Creatures.findOneAsync(creatureId);
  if (!creature) throw new Meteor.Error('creature-not-found', 'Creature not found');
  const properties = await CreatureProperties.find({ ...getFilter.descendantsOfRoot(creatureId) }).fetchAsync();
  const experiences = await Experiences.find({ creatureId }).fetchAsync();
  const logs = await CreatureLogs.find({ creatureId }).fetchAsync();
  const archiveCreature = {
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

export async function archiveCreature(creatureId) {
  const archive = await getArchiveObj(creatureId);
  const buffer = Buffer.from(JSON.stringify(archive, null, 2));
  return new Promise((resolve, reject) => {
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
        reject(error);
      } else if (!Meteor.settings.useS3) {
        removeCreatureWork(creatureId).then(resolve, reject);
      } else {
        const resultHandler = (s3Error, resultRef) => {
          if (resultRef._id !== fileRef._id) return;
          ArchiveCreatureFiles.off('s3Result', resultHandler);
          if (!s3Error) {
            removeCreatureWork(creatureId).then(resolve, reject);
          } else {
            reject(s3Error);
          }
        };
        ArchiveCreatureFiles.on('s3Result', resultHandler);
      }
    }, true);
  });
}

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
      await archiveCreature(creatureId);
    } else {
      await removeCreatureWork(creatureId);
    }
  },
});

export default archiveCreatureToFile;
