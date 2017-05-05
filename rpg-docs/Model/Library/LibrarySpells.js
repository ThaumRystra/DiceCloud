LibrarySpells = new Mongo.Collection("librarySpells");

Schemas.LibrarySpells = new SimpleSchema({
	name: {
		type: String,
		trim: false,
		defaultValue: "New Spell",
	},
	description: {
		type: String,
		optional: true,
		trim: false,
	},
	castingTime: {
		type: String,
		optional: true,
		defaultValue: "action",
		trim: false,
	},
	range: {
		type: String,
		optional: true,
		trim: false,
	},
	duration: {
		type: String,
		optional: true,
		trim: false,
		defaultValue: "Instantaneous",
	},
	"components.verbal":        {type: Boolean, defaultValue: false},
	"components.somatic":       {type: Boolean, defaultValue: false},
	"components.concentration":	{type: Boolean, defaultValue: false},
	"components.material":      {type: String, optional: true},
	ritual:      {
		type: Boolean,
		defaultValue: false,
	},
	level:       {
		type: Number,
		defaultValue: 1,
	},
	school:      {
		type: String,
		defaultValue: "Abjuration",
		allowedValues: magicSchools,
	},
	library:    {type: String, regEx: SimpleSchema.RegEx.Id, index: 1},
	effects: {type: [Schemas.LibraryEffects], defaultValue: []},
	attacks: {type: [Schemas.LibraryAttacks], defaultValue: []},
});

LibrarySpells.attachSchema(Schemas.LibrarySpells);

LibrarySpells.allow({
	insert(userId, doc) {
		return Libraries.canEdit(userId, doc.library);
	},
	update(userId, doc, fields, modifier) {
		return Libraries.canEdit(userId, doc.library);
	},
	remove(userId, doc) {
		return Libraries.canEdit(userId, doc.library);
	},
	fetch: ["library"],
});
