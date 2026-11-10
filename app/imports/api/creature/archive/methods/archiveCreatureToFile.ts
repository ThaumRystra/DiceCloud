import { Meteor } from 'meteor/meteor';
import SCHEMA_VERSION from '/imports/constants/SCHEMA_VERSION';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertOwnership } from '/imports/api/creature/creatures/creaturePermissions';
import Creatures, {
  type CreatureId,
} from '/imports/api/creature/creatures/Creatures';
import { CreatureProperties } from '/imports/api/creature/creatureProperties/CreatureProperties';
import CreatureLogs from '/imports/api/creature/log/CreatureLogs';
import Experiences from '/imports/api/creature/experience/Experiences';
import { removeCreatureWork } from '/imports/api/creature/creatures/methods/removeCreature';
import { ArchiveCreatureFiles } from '/imports/api/creature/archive/ArchiveCreatureFiles';
import { getFilter } from '/imports/api/parenting/parentingFunctions';
import { writeJsonFile } from '/imports/api/files/server/s3FileStorage';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';
import type z from 'zod';

export async function getArchiveObj(creatureId: CreatureId) {
  const creature = await Creatures.findOneAsync(creatureId);
  if (!creature)
    throw new Meteor.Error('creature-not-found', 'Creature not found');
  const properties = await CreatureProperties.find({
    ...getFilter.descendantsOfRoot(creatureId),
  }).fetchAsync();
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

export async function archiveCreature(creatureId: CreatureId) {
  const archive = await getArchiveObj(creatureId);
  const jsonString = JSON.stringify(archive, null, 2);
  const fileName = `${creatureId}.json`;
  await writeJsonFile(`${creatureId}.json`, jsonString);
  await ArchiveCreatureFiles.insertAsync({
    userId: archive.creature.owner as string & z.BRAND<'UserId'>,
    creatureId: archive.creature._id,
    creatureName: archive.creature.name,
    fileName,
    schemaVersion: archive.meta.schemaVersion,
    archivedAt: archive.meta.archiveDate,
    sizeKb: 0,
  });
  await removeCreatureWork(creatureId);
}

const archiveCreatureToFile = new ValidatedMethod({
  name: 'Creatures.methods.archiveCreatureToFile',
  validate: TypedSimpleSchema.from({
    creatureId: {
      type: String,
      max: 32,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 10,
    timeInterval: 5000,
  },
  async run({ creatureId }: { creatureId: CreatureId }) {
    await assertOwnership(creatureId, this.userId);
    if (Meteor.isServer) {
      await archiveCreature(creatureId);
    } else {
      await removeCreatureWork(creatureId);
    }
  },
});

export default archiveCreatureToFile;
