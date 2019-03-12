import SimpleSchema from 'simpl-schema';
import Creatures from '/imports/api/creature/Creatures.js';
import creatureCollections from '/imports/api/creature/creatureCollections.js';
import { assertOwnership } from '/imports/api/creature/creaturePermissions.js';

function removeRelatedDocuments(charId){
  creatureCollections.forEach(collection => {
    collection.remove({charId}, error => {
      if (error) console.error(error);
    });
  });
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
