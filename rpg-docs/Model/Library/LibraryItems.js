LibraryItems = new Mongo.Collection("libraryItems");

Schemas.LibraryItems = new SimpleSchema({
	name:       {type: String, defaultValue: "New Item", trim: false},
	plural:		{type: String, optional: true, trim: false},
	description:{type: String, optional: true, trim: false},
	quantity:	{type: Number, min: 0, defaultValue: 1},
	weight:		{type: Number, min: 0, defaultValue: 0, decimal: true},
	value:		{type: Number, min: 0, defaultValue: 0, decimal: true},
	requiresAttunement: {type: Boolean, defaultValue: false},

	library:    {type: String, regEx: SimpleSchema.RegEx.Id, index: 1},

	"settings.category":   {
		type: String,
		optional: true,
		allowedValues: [
			"adventuringGear", "armor", "weapons", "tools",
		],
	},
	"settings.showIncrement": {
		type: Boolean,
		defaultValue: false,
	},

	effects: {type: [Schemas.LibraryEffects], defaultValue: []},
	attacks: {type: [Schemas.LibraryAttacks], defaultValue: []},
});

LibraryItems.attachSchema(Schemas.LibraryItems);

LibraryItems.allow({
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
