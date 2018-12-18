import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import Effects from "/imports/api/creature/properties/Effects.js"
import deathSaveSchema from "/imports/api/creature/subSchemas/DeathSavesSchema.js"
import ColorSchema from "/imports/api/creature/subSchemas/ColorSchema.js";
import getDefaultCreatureDocs from "/imports/api/creature/getDefaultCreatureDocs.js";

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
	readers: {type: Array, defaultValue: [], index: 1},
	"readers.$": {type: String, regEx: SimpleSchema.RegEx.Id},
	writers: {type: Array, defaultValue: [], index: 1},
	"writers.$": {type: String, regEx: SimpleSchema.RegEx.Id},
	settings: {type: Object},
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
}

export default Creatures;
