import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertOwnership } from '/imports/api/creature/creatures/creaturePermissions';
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import CreatureLogs from '/imports/api/creature/log/CreatureLogs';
import Experiences from '/imports/api/creature/experience/Experiences';
import { getFilter } from '/imports/api/parenting/parentingFunctions';

async function removeRelatedDocuments(creatureId) {
  await CreatureVariables.removeAsync({ _creatureId: creatureId });
  await CreatureProperties.removeAsync(getFilter.descendantsOfRoot(creatureId));
  await CreatureLogs.removeAsync({ creatureId });
  await Experiences.removeAsync({ creatureId });
}

const removeCreature = new ValidatedMethod({
  name: 'Creatures.methods.removeCreature', // DDP method name
  validate: new SimpleSchema({
    charId: {
      type: String,
      max: 32,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ charId }) {
    assertOwnership(charId, this.userId)
    this.unblock();
    await removeCreatureWork(charId)
  },
});

export async function removeCreatureWork(creatureId) {
  await Creatures.removeAsync(creatureId);
  await removeRelatedDocuments(creatureId);
}

export default removeCreature;
