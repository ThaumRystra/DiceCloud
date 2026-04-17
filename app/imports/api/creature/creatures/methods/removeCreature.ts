import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { assertOwnership } from '/imports/api/creature/creatures/creaturePermissions';
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureVariables from '../../../engine/shared/scope';
import Experiences from '/imports/api/creature/experience/Experiences';
import CreatureLogs from '/imports/api/creature/log/CreatureLogs';
import { getFilter } from '/imports/api/parenting/parentingFunctions';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

async function removeRelatedDocuments(creatureId: string) {
  await CreatureVariables.removeAsync({ _creatureId: creatureId });
  await CreatureProperties.removeAsync(getFilter.descendantsOfRoot(creatureId));
  await CreatureLogs.removeAsync({ creatureId });
  await Experiences.removeAsync({ creatureId });
}

const removeCreature = new ValidatedMethod({
  name: 'Creatures.methods.removeCreature', // DDP method name
  validate: TypedSimpleSchema.from({
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
    await assertOwnership(charId, this.userId)
    this.unblock();
    await removeCreatureWork(charId)
  },
});

export async function removeCreatureWork(creatureId: string) {
  await Creatures.removeAsync(creatureId);
  await removeRelatedDocuments(creatureId);
}

export default removeCreature;
