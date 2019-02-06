import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import libraryAttacksSchema from "/imports/api/library/";

LibraryItems = new Mongo.Collection("libraryItems");

libraryItemsSchema = schema({
	libraryName:{type: String, optional: true, trim: false},
	name:       {type: String, defaultValue: "New Item", trim: false},
	plural:		{type: String, optional: true, trim: false},
	description:{type: String, optional: true, trim: false},
	quantity:	{type: SimpleSchema.Integer, min: 0, defaultValue: 1},
	weight:		{type: Number, min: 0, defaultValue: 0},
	value:		{type: Number, min: 0, defaultValue: 0},
	requiresAttunement: {type: Boolean, defaultValue: false},

	library:    {type: String, regEx: SimpleSchema.RegEx.Id, index: 1},

	settings: {type: Object},
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

	effects: [Schemas.LibraryEffects],
	attacks: [Schemas.LibraryAttacks],
});

LibraryItems.attachSchema(libraryItemsSchema);

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
