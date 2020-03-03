import SimpleSchema from 'simpl-schema';
import Creatures from '/imports/api/creature/Creatures.js';
import CreatureProperties from '/imports/api/creature/CreatureProperties.js'
import { assertOwnership } from '/imports/api/creature/creaturePermissions.js';

function removeRelatedDocuments(charId){
  CreatureProperties.remove({'ancestors.id': charId});
};

const removeCreature = new ValidatedMethod({
  name: "Creatures.methods.removeCreature", // DDP method name
  validate: new SimpleSchema({
    charId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  run({charId}) {
    assertOwnership(charId, this.userId)
    Creatures.remove(charId);
		this.unblock();
		removeRelatedDocuments(charId);
  },
});

export default removeCreature;
