import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import Effects from "/imports/api/creature/Effects.js"
import deathSaveSchema from "/imports/api/creature/subSchemas/DeathSaves.js"
import ColorSchema from "/imports/api/creature/subSchemas/ColorSchema.js";

//set up the collection for creatures
Creatures = new Mongo.Collection("creatures");

let creatureSchema = new SimpleSchema({
	//strings
	name:         {type: String, defaultValue: "", trim: false, optional: true},
	urlName:      {type: String, defaultValue: "-", trim: false, optional: true},
	alignment:    {type: String, defaultValue: "", trim: false, optional: true},
	gender:       {type: String, defaultValue: "", trim: false, optional: true},
	race:         {type: String, defaultValue: "", trim: false, optional: true},
	picture:      {type: String, defaultValue: "", trim: true,  optional: true},
	description:  {type: String, defaultValue: "", trim: false, optional: true},
	personality:  {type: String, defaultValue: "", trim: false, optional: true},
	ideals:       {type: String, defaultValue: "", trim: false, optional: true},
	bonds:        {type: String, defaultValue: "", trim: false, optional: true},
	flaws:        {type: String, defaultValue: "", trim: false, optional: true},
	backstory:    {type: String, defaultValue: "", trim: false, optional: true},

	//mechanics
	deathSave:     {type: deathSaveSchema},
	xp:            {type: SimpleSchema.Integer, defaultValue: 0},
	weightCarried: {type: Number, defaultValue: 0},
	level:         {type: SimpleSchema.Integer, defaultValue: 0},
	type:          {type: String, defaultValue: "pc", allowedValues: ["pc", "npc", "monster"]},

	//permissions
	party:   {type: String, regEx: SimpleSchema.RegEx.Id, optional: true},
	owner:   {type: String, regEx: SimpleSchema.RegEx.Id, index: 1},
	readers: {type: [String], regEx: SimpleSchema.RegEx.Id, defaultValue: [], index: 1},
	writers: {type: [String], regEx: SimpleSchema.RegEx.Id, defaultValue: [], index: 1},
	//TODO add per-creature settings
	//how many experiences to load at a time in XP table
	"settings.experiencesInc": {type: SimpleSchema.Integer, defaultValue: 20},
	//slowed down by carrying too much?
	"settings.useVariantEncumbrance": {type: Boolean, defaultValue: false},
	"settings.useStandardEncumbrance": {type: Boolean, defaultValue: true},
	//hide spellcasting
	"settings.hideSpellcasting": {type: Boolean, defaultValue: false},
	//show to anyone with link
	"settings.viewPermission": {
		type: String,
		defaultValue: "whitelist",
		allowedValues: ["whitelist", "public"],
		index: 1,
	},
	"settings.swapStatAndModifier": {type: Boolean, defaultValue: false},
	"settings.exportFeatures": {type: Boolean, defaultValue: true},
	"settings.exportAttacks": {type: Boolean, defaultValue: true},
	"settings.exportDescription": {type: Boolean, defaultValue: true},
	"settings.newUserExperience": {type: Boolean, optional: true},
});

Creatures.attachSchema(creatureSchema);
Creatures.attachSchema(ColorSchema);

Creatures.calculate = {
	xpLevel: function(charId){
		var xp = Creatures.calculate.experience(charId);
		for (var i = 0; i < 19; i++){
			if (xp < XP_TABLE[i]){
				return i;
			}
		}
		if (xp > 355000) return 20;
		return 0;
	},
};

const insertCharacter = new ValidatedMethod({

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

const addDefaultStats = function(charId){
	const defaultDocs = getDefaultCreatureDocs(charId);
	Attributes.rawCollection().insert(defaultDocs.attributes, {ordered: false});
	Skills.rawCollection().insert(defaultDocs.skills, {ordered: false});
	DamageMultipliers.rawCollection().insert(defaultDocs.damageMultipliers, {ordered: false});
};

//clean up all data related to that creature before removing it
if (Meteor.isServer){
	Creatures.after.remove(function(userId, creature) {
		let charId = creature._id;
		Actions          .remove({charId});
		Attacks          .remove({charId});
		Attributes       .remove({charId});
		Buffs            .remove({charId});
		Classes          .remove({charId});
		CustomBuffs      .remove({charId});
		DamageMultipliers.remove({charId});
		Effects          .remove({charId});
		Experiences      .remove({charId});
		Features         .remove({charId});
		Notes            .remove({charId});
		Proficiencies    .remove({charId});
		Skills           .remove({charId});
		SpellLists       .remove({charId});
		Items            .remove({charId});
		Containers       .remove({charId});
	});
	Creatures.after.update(function(userId, doc, fieldNames, modifier, options) {
		if (_.contains(fieldNames, "name")){
			var urlName = getSlug(doc.name, {maintainCase: true}) || "-";
			Creatures.update(doc._id, {$set: {urlName}});
		}
	});
	Creatures.before.insert(function(userId, doc) {
		doc.urlName = getSlug(doc.name, {maintainCase: true}) || "-";
		// The first creature a user creates should have the new user experience
		if (!Creatures.find({owner: userId}).count()){
			doc.settings.newUserExperience = true;
		}
	});

	//give characters default items
	Characters.after.insert(function(userId, char) {
		if (Meteor.isServer){
			var containerId = Containers.insert({
				name: "Coin Pouch",
				charId: char._id,
				isCarried: true,
				description: "A sturdy pouch for coins",
				color: "d",
			});
			Items.insert({
				name: "Gold piece",
				plural: "Gold pieces",
				charId: char._id,
				quantity: 0,
				weight: 0.02,
				value: 1,
				color: "n",
				parent: {
					id: containerId,
					collection: "Containers",
				},
				settings: {
					showIncrement: true,
				},
			});
			Items.insert({
				name: "Silver piece",
				plural: "Silver pieces",
				charId: char._id,
				quantity: 0,
				weight: 0.02,
				value: 0.1,
				color: "q",
				parent: {
					id: containerId,
					collection: "Containers",
				},
				settings: {
					showIncrement: true,
				},
			});
			Items.insert({
				name: "Copper piece",
				plural: "Copper pieces",
				charId: char._id,
				quantity: 0,
				weight: 0.02,
				value: 0.01,
				color: "s",
				parent: {
					id: containerId,
					collection: "Containers",
				},
				settings: {
					showIncrement: true,
				},
			});
		}
	});
}

Creatures.allow({
	insert: function(userId, doc) {
		// the user must be logged in, and the document must be owned by the user
		return (userId && doc.owner === userId);
	},
	update: function(userId, doc, fields, modifier) {
		// can only change documents you have write access to
		return doc.owner === userId ||
			_.contains(doc.writers, userId);
	},
	remove: function(userId, doc) {
		// can only remove your own documents
		return doc.owner === userId;
	},
	fetch: ["owner", "writers"],
});

Creatures.deny({
	update: function(userId, docs, fields, modifier) {
		// can't change owners
		return _.contains(fields, "owner");
	}
});

export default Creatures;
