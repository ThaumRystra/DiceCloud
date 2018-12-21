import getDefaultCharacterDocs from '/imports/api/creature/getDefaultCharacterDocs.js';
import Attributes from '/imports/api/creature/properties/Attributes.js';
import Skills from '/imports/api/creature/properties/Skills.js';
import DamageMultipliers from '/imports/api/creature/properties/DamageMultipliers.js';
import Effects from '/imports/api/creature/properties/Effects.js';
import Containers from '/imports/api/inventory/Containers.js';
import Items from '/imports/api/inventory/Items.js';
import Classes from '/imports/api/creature/properties/Classes.js';

const addDefaultDocs = function(docs){
	Attributes.rawCollection().insert(docs.attributes, {ordered: false});
	Skills.rawCollection().insert(docs.skills, {ordered: false});
	DamageMultipliers.rawCollection().insert(docs.damageMultipliers, {ordered: false});
	Effects.rawCollection().insert(docs.effects, {ordered: false});
	Containers.rawCollection().insert(docs.containers, {ordered: false});
	Items.rawCollection().insert(docs.items, {ordered: false});
	Classes.rawCollection().insert(docs.classes, {ordered: false});
};

const insertCreature = new ValidatedMethod({

  name: "Creatures.methods.insertCreature",

  validate: null,

  run(characterFormData) {
    if (!this.userId) {
      throw new Meteor.Error("Creatures.methods.insert.denied",
      "You need to be logged in to insert a creature");
    }

		// Create the creature document
    let charId = Creatures.insert({
			name: characterFormData.name,
			owner: this.userId,
			alignment: characterFormData.alignment,
			gender: characterFormData.gender,
			race: characterFormData.race,
		});
		this.unblock();
		if (Meteor.isServer){
			//Add all the required attributes to it
			let docs = getDefaultCharacterDocs(charId, characterFormData);
			addDefaultDocs(docs);
		}
		return charId;
  },

});

export default insertCreature;
