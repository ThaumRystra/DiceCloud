LibraryEquipmentPacks = new Mongo.Collection("libraryEquipmentPacks");

Schemas.LibraryEquipmentPacks = new SimpleSchema({
	name:       {type: String, defaultValue: "New Item", trim: false},
	cost:		{type: Number, defaultValue: "10"},

	"container":			{type: Object},
	"container.name":		{type: String, defaultValue:"Backpack", trim: false},
	"container.inLibrary":	{type: Boolean, defaultValue: true},

	"contents.$.name":		{type: String, trim: false},
	"contents.$.inLibrary":	{type: Boolean, defaultValue: true},
	"contents.$.quantity":	{type: Number, defaultValue: 1},

	library:    {type: String, regEx: SimpleSchema.RegEx.Id, index: 1},
});

LibraryEquipmentPacks.attachSchema(Schemas.LibraryEquipmentPacks);

LibraryEquipmentPacks.allow({
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
