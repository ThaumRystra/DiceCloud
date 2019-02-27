import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import deathSaveSchema from "/imports/api/creature/subSchemas/DeathSavesSchema.js"
import ColorSchema from "/imports/api/creature/subSchemas/ColorSchema.js";

//Methods
import '/imports/api/creature/insertCreature.js';
import '/imports/api/creature/removeCreature.js';

//set up the collection for creatures
Creatures = new Mongo.Collection("creatures");

let creatureSchema = schema({
	//strings
	name:         {type: String, defaultValue: "", trim: false, optional: true},
	urlName:      {type: String, trim: false, optional: true,
		autoValue: function() {
			return getSlug(this.field("name").value, {maintainCase: true}) || "-";
		},
	},
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

	//computed
	variables: {type: Object, blackbox: true, defaultValue: {}},

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

export default Creatures;
