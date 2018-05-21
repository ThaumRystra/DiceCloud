ChangeLogs = new Mongo.Collection("changeLogs");

Schemas.ChangeLog = new SimpleSchema({
	version: {
		type: String,
	},
	changes: {
		type: [String],
	},
});

ChangeLogs.attachSchema(Schemas.ChangeLog);

ChangeLogs.allow({
	insert: function(userId, doc) {
		var user = Meteor.users.findOne(userId);
		if (user) return _.contains(user.roles, "admin");
	},
	update: function(userId, doc, fields, modifier) {
		var user = Meteor.users.findOne(userId);
		if (user) return _.contains(user.roles, "admin");
	},
	remove: function(userId, doc) {
		var user = Meteor.users.findOne(userId);
		if (user) return _.contains(user.roles, "admin");
	},
});
