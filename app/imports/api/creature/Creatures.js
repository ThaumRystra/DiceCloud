import SimpleSchema from 'simpl-schema';
import deathSaveSchema from "/imports/api/creature/subSchemas/DeathSavesSchema.js"
import ColorSchema from "/imports/api/creature/subSchemas/ColorSchema.js";

//Methods
import '/imports/api/creature/insertCreature.js';
import '/imports/api/creature/removeCreature.js';

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
	deathSave:     {type: deathSaveSchema, defaultValue: {}},
	xp:            {type: SimpleSchema.Integer, defaultValue: 0},
	weightCarried: {type: Number, defaultValue: 0},
	level:         {type: SimpleSchema.Integer, defaultValue: 0},
	type:          {type: String, defaultValue: "pc", allowedValues: ["pc", "npc", "monster"]},

	//permissions
	owner:   {type: String, regEx: SimpleSchema.RegEx.Id, index: 1},
	readers: {type: Array, defaultValue: [], index: 1},
	"readers.$": {type: String, regEx: SimpleSchema.RegEx.Id},
	writers: {type: Array, defaultValue: [], index: 1},
	"writers.$": {type: String, regEx: SimpleSchema.RegEx.Id},
	settings: {type: Object, defaultValue: {}},
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

//Keep the urlName up to date
if (Meteor.isServer){
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
