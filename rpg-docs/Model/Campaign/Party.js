Parties = new Mongo.Collection("parties");

Schemas.Party = new SimpleSchema({
	name: {
		type: String,
		defaultValue: "New Party",
		trim: false,
		optional: true,
	},
	characters: {
		type: [String],
		regEx: SimpleSchema.RegEx.Id,
		index: 1,
		defaultValue: [],
	},
	owner: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
	},
});

Parties.attachSchema(Schemas.Party);

Parties.allow({
	insert: function(userId, doc) {
		return userId && doc.owner === userId;
	},
	update: function(userId, doc, fields, modifier) {
		return userId && doc.owner === userId;
	},
	remove: function(userId, doc) {
		return userId && doc.owner === userId;
	},
	fetch: ["owner"],
});

Parties.deny({
	update: function(userId, docs, fields, modifier) {
		// can't change owners
		return _.contains(fields, "owner");
	}
});
