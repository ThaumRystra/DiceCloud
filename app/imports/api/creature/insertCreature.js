import getDefaultCharacterDocs from '/imports/api/creature/getDefaultCharacterDocs.js';
import Attributes from '/imports/api/properties/Attributes.js';
import Skills from '/imports/api/properties/Skills.js';
import DamageMultipliers from '/imports/api/properties/DamageMultipliers.js';
import Effects from '/imports/api/properties/Effects.js';
import Containers from '/imports/api/properties/Containers.js';
import Items from '/imports/api/properties/Items.js';

const addDefaultDocs = function(docs){
	Attributes.rawCollection().insert(docs.attributes, {ordered: false});
	Skills.rawCollection().insert(docs.skills, {ordered: false});
	DamageMultipliers.rawCollection().insert(docs.damageMultipliers, {ordered: false});
	Effects.rawCollection().insert(docs.effects, {ordered: false});
	Containers.rawCollection().insert(docs.containers, {ordered: false});
	Items.rawCollection().insert(docs.items, {ordered: false});
};

const insertCreature = new ValidatedMethod({

  name: "Creatures.methods.insertCreature",

  validate: null,

  run() {
    if (!this.userId) {
      throw new Meteor.Error("Creatures.methods.insert.denied",
      "You need to be logged in to insert a creature");
    }

		// Create the creature document
    let charId = Creatures.insert({
			owner: this.userId,
		});
		this.unblock();
		return charId;
  },

});

export default insertCreature;
