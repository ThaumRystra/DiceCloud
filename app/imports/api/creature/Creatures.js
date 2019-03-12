import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import deathSaveSchema from "/imports/api/creature/subSchemas/DeathSavesSchema.js"
import ColorSchema from "/imports/api/creature/subSchemas/ColorSchema.js";
import SharingSchema from '/imports/api/sharing/SharingSchema.js';

//Methods
import '/imports/api/creature/insertCreature.js';
import '/imports/api/creature/removeCreature.js';

//set up the collection for creatures
Creatures = new Mongo.Collection("creatures");

let CreatureSettingsSchema = new SimpleSchema({
	//slowed down by carrying too much?
	useVariantEncumbrance: {
		type: Boolean,
		optional: true,
	},
	//hide spellcasting tab
	hideSpellcasting: {
		type: Boolean,
		optional: true,
	},
	// Swap around the modifier and stat
	swapStatAndModifier: {
		type: Boolean,
		optional: true,
	},
});

let CreatureSchema = schema({
	// Strings
	name: {
		type: String,
		defaultValue: "",
		optional: true,
	},
	urlName: {
		type: String,
		optional: true,
		autoValue: function() {
			return getSlug(this.field("name").value, {maintainCase: true}) || "-";
		},
	},
	alignment: {
		type: String,
		optional: true
	},
	gender: 			{
		type: String,
		optional: true
	},
	race:         {
		type: String,
		optional: true
	},
	picture:      {
		type: String,
		optional: true
	},
	description:  {
		type: String,
		optional: true
	},
	personality:  {
		type: String,
		optional: true
	},
	ideals:       {
		type: String,
		optional: true
	},
	bonds:        {
		type: String,
		optional: true
	},
	flaws:        {
		type: String,
		optional: true
	},
	backstory:    {
		type: String,
		optional: true
	},

	// Mechanics
	deathSave: {
		type: deathSaveSchema,
		defaultValue: {},
	},
	xp: {
		type: SimpleSchema.Integer,
		defaultValue: 0,
	},
	weightCarried: {
		type: Number,
		defaultValue: 0,
	},
	level: {
		type: SimpleSchema.Integer,
		defaultValue: 0,
	},
	type: {
		type: String,
		defaultValue: "pc",
		allowedValues: ["pc", "npc", "monster"],
	},

	// Computed
	variables: {
		type: Object,
		blackbox: true,
		defaultValue: {}
	},

	// Settings
	settings: {
		type: CreatureSettingsSchema,
		defaultValue: {},
	},
});

CreatureSchema.extend(ColorSchema);
CreatureSchema.extend(SharingSchema);

Creatures.attachSchema(CreatureSchema);

export default Creatures;
export { CreatureSchema };
