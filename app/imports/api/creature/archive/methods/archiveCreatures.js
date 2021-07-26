import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertOwnership } from '/imports/api/creature/creatures/creaturePermissions.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import CreatureLogs from '/imports/api/creature/log/CreatureLogs.js';
import Experiences from '/imports/api/creature/experience/Experiences.js';
import { removeCreatureWork } from '/imports/api/creature/creatures/methods/removeCreature.js';
import ArchivedCreatures from '/imports/api/creature/archive/ArchivedCreatures.js';

function archiveCreature(creatureId){
  // Build the archive document
  const creature = Creatures.findOne(creatureId);
  const properties = CreatureProperties.find({'ancestors.id': creatureId}).fetch();
  const experiences = Experiences.find({creatureId}).fetch();
  const logs = CreatureLogs.find({creatureId}).fetch();
  let archiveCreature = {
    owner: creature.owner,
    archiveDate: new Date(),
    creature,
    properties,
    experiences,
    logs,
  };

  // Insert it
  let id = ArchivedCreatures.insert(archiveCreature);

  // Remove the original creature
  removeCreatureWork(creatureId);

  return id;
}

const archiveCreatures = new ValidatedMethod({
  name: 'Creatures.methods.archiveCreatures',
  validate: new SimpleSchema({
    creatureIds: {
      type: Array,
      max: 10,
    },
    'creatureIds.$': {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 1,
    timeInterval: 5000,
  },
  run({creatureIds}) {
    for (let id of creatureIds){
      assertOwnership(id, this.userId)
    }
    let archivedIds = [];
    for (let id of creatureIds){
      let archivedId = archiveCreature(id);
      archivedIds.push(archivedId);
    }
    return archivedIds;
  },
});

export default archiveCreatures;
