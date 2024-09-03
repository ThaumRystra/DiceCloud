import SCHEMA_VERSION from '/imports/constants/SCHEMA_VERSION';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import CreatureLogs from '/imports/api/creature/log/CreatureLogs';
import Experiences from '/imports/api/creature/experience/Experiences';
import { removeCreatureWork } from '/imports/api/creature/creatures/methods/removeCreature';
import assertHasCharactersSlots from '/imports/api/creature/creatures/methods/assertHasCharacterSlots';
import verifyArchiveSafety from '/imports/api/creature/archive/methods/verifyArchiveSafety';

let migrateApiCharacter;
if (Meteor.isServer) {
  migrateApiCharacter = require('/imports/migrations/apiCreature/migrateApiCreature2To3.js').default;
}

function importApiCreature(apiCreature, userId) {
  const apiVersion = apiCreature.meta?.schemaVersion ?? 2;
  const creatureId = apiCreature.creatures[0]._id;
  if (SCHEMA_VERSION < apiVersion) {
    throw new Meteor.Error('Incompatible',
      'The creature on the remote server is from a newer version of DiceCloud')
  }

  // Migrate and verify the archive meets the current schema
  migrateApiCharacter(apiCreature);

  // Asset that the api creature is (mildly) safe
  verifyArchiveSafety({
    creature: apiCreature.creatures[0],
    properties: apiCreature.creatureProperties ?? [],
    experiences: apiCreature.experiences ?? [],
    logs: apiCreature.logs ?? [],
  });

  // Don't upload creatures twice
  const existingCreature = Creatures.findOne(apiCreature.creatures[0]._id, {
    fields: { _id: 1 }
  });

  if (existingCreature) throw new Meteor.Error('Already exists',
    'The creature you are trying to import already exists in this database.')

  // Ensure the user owns the restored creature
  apiCreature.creatures[0].owner = userId;

  // Ensure there is only 1 creature being imported
  if (apiCreature.creatures.length !== 1) {
    throw new Meteor.Error('invalid-import',
      'One and only one creature must be imported at a time'
    )
  }

  // Insert the creature sub documents
  // They still have their original _id's
  Creatures.insert(apiCreature.creatures[0]);
  try {
    // Add all the properties
    if (apiCreature.creatureProperties && apiCreature.creatureProperties.length) {
      CreatureProperties.batchInsert(apiCreature.creatureProperties);
    }
    if (apiCreature.experiences && apiCreature.experiences.length) {
      Experiences.batchInsert(apiCreature.experiences);
    }
    if (apiCreature.logs && apiCreature.logs.length) {
      CreatureLogs.batchInsert(apiCreature.logs);
    }
  } catch (e) {
    // If the above fails, delete the inserted creature
    removeCreatureWork(creatureId);
    throw e;
  }
  return creatureId;
}

const importCharacterFromDiceCloudInstance = new ValidatedMethod({
  name: 'Creatures.methods.importFromInstance',
  validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 10,
    timeInterval: 5000,
  },
  async run({ characterData }) {
    if (Meteor.settings.public.disallowCreatureApiImport) throw new Meteor.Error('not-allowed',
      'This instance of DiceCloud has disallowed creature imports')
    // fetch the file
    if (!characterData) {
      throw new Meteor.Error('no-input',
        'No character data was provided');
    }
    assertHasCharactersSlots(this.userId);
    if (Meteor.isServer) {
      return importApiCreature(characterData, this.userId)
    }
  },
});

export default importCharacterFromDiceCloudInstance;
