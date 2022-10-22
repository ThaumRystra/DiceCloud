import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertOwnership } from '/imports/api/creature/creatures/creaturePermissions.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import CreatureLogs from '/imports/api/creature/log/CreatureLogs.js';
import Experiences from '/imports/api/creature/experience/Experiences.js';

function removeRelatedDocuments(creatureId){
  CreatureVariables.remove({_creatureId: creatureId});
  CreatureProperties.remove({'ancestors.id': creatureId});
  CreatureLogs.remove({creatureId});
  Experiences.remove({creatureId});
}

const removeCreature = new ValidatedMethod({
  name: 'Creatures.methods.removeCreature', // DDP method name
  validate: new SimpleSchema({
    charId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({charId}) {
    assertOwnership(charId, this.userId)
    this.unblock();
    removeCreatureWork(charId)
  },
});

export function removeCreatureWork(creatureId){
  Creatures.remove(creatureId);
  removeRelatedDocuments(creatureId);
}

export default removeCreature;
