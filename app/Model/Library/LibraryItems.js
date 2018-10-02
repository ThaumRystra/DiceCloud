LibraryItems = new Mongo.Collection("libraryItems");

Schemas.LibraryItems = new SimpleSchema({
	libraryName:{type: String, optional: true, trim: false},
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

Meteor.methods({
	updateLibraryItemEffect: function({itemId, effectIndex, field, value, unsetField}){
		let libraryId = LibraryItems.findOne(itemId).library;
		let userId = Meteor.userId();
		if (!Libraries.canEdit(userId, libraryId)) return;
		let modifier = {
			$set: {
				[`effects.${effectIndex}.${field}`]: value,
			}
		};
		if (unsetField){
			modifier.$unset = {
				[`effects.${effectIndex}.${unsetField}`]: 1,
			}
		}
		LibraryItems.update(itemId, modifier);
	},
	removeLibraryItemEffect: function({itemId, effectIndex}){
		let libraryId = LibraryItems.findOne(itemId).library;
		let userId = Meteor.userId();
		if (!Libraries.canEdit(userId, libraryId)) return;
		LibraryItems.update(itemId, {$unset : {
			[`effects.${effectIndex}`] : 1,
		}});
		LibraryItems.update(itemId, {$pull : {"effects" : null}});
	},
	updateLibraryItemAttack: function({itemId, attackIndex, field, value}){
		let libraryId = LibraryItems.findOne(itemId).library;
		let userId = Meteor.userId();
		if (!Libraries.canEdit(userId, libraryId)) return;
		LibraryItems.update(itemId, {
			$set: {
				[`attacks.${attackIndex}.${field}`]: value,
			}
		});
	},
	removeLibraryItemAttack: function({itemId, attackIndex}){
		let libraryId = LibraryItems.findOne(itemId).library;
		let userId = Meteor.userId();
		if (!Libraries.canEdit(userId, libraryId)) return;
		LibraryItems.update(itemId, {$unset : {
			[`attacks.${attackIndex}`] : 1,
		}});
		LibraryItems.update(itemId, {$pull : {"attacks" : null}});
	},
})
