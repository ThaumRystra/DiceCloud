import getDefaultCreatureDocs from '/imports/api/creature/getDefaultCreatureDocs.js';

const addDefaultStats = function(charId){
	const defaultDocs = getDefaultCreatureDocs(charId);
	Attributes.rawCollection().insert(getDefa.attributes, {ordered: false});
	Skills.rawCollection().insert(getDefa.skills, {ordered: false});
	DamageMultipliers.rawCollection().insert(getDefa.damageMultipliers, {ordered: false});
};

const insertCreature = new ValidatedMethod({

  name: "Creatures.methods.insertCharacter", // DDP method name

  validate: new SimpleSchema({
	  name: {
		  type: String,
		  optional: true,
	  },
  }).validator(),

  run({name}) {
    if (!this.userId) {
      throw new Meteor.Error("Creatures.methods.insert.denied",
      "You need to be logged in to insert a creature");
    }

		// Create the creature document
    let charId = Creatures.insert({name, owner: this.userId});
		this.unblock();
		//Add all the required attributes to it
		if (Meteor.isServer){
			addDefaultStats(charId);
		}
		return charId;
  },

});

export default insertCreature;
