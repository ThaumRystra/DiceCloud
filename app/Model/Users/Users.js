Schemas.UserProfile = new SimpleSchema({
	username: {
		type: String,
		optional: true,
	},
	librarySubscriptions: {
		type: [String],
		defaultValue: [],
	},
});

Schemas.User = new SimpleSchema({
	username: {
		type: String,
		optional: true,
	},
	profile: {
		type: Schemas.UserProfile,
		optional: true,
	},
	emails: {
		type: Array,
		optional: true,
	},
	"emails.$": {
		type: Object,
	},
	"emails.$.address": {
		type: String,
		regEx: SimpleSchema.RegEx.Email,
	},
	"emails.$.verified": {
		type: Boolean,
	},
	registered_emails: {
		type: Array,
		optional: true,
	},
	"registered_emails.$": {
		type: Object,
		blackbox: true,
	},
	createdAt: {
		type: Date
	},
	services: {
		type: Object,
		optional: true,
		blackbox: true,
	},
	roles: {
		type: Object,
		optional: true,
		blackbox: true,
	},
	roles: {
		type: Array,
		optional: true,
	},
	"roles.$": {
		type: String
	},
	// In order to avoid an 'Exception in setInterval callback' from Meteor
	heartbeat: {
		type: Date,
		optional: true,
	},
	apiKey: {
		type: String,
		index: 1,
		optional: true,
	},
});

Meteor.users.attachSchema(Schemas.User);

Meteor.users.allow({
	update: function(userId, doc, fields, modifier) {
		if (
			doc._id === userId &&
			_.contains(fields, "username") &&
			_.contains(fields, "profile") &&
			fields.length === 2 &&
			_.keys(modifier).length === 1 &&
			modifier.$set &&
			modifier.$set["profile.username"] &&
			modifier.$set.username &&
			_.keys(modifier.$set).length === 2
		){
			var expectedUsername = modifier.$set["profile.username"];
			expectedUsername = expectedUsername.toLowerCase().replace(/\s+/gm, "");
			if (modifier.$set.username !== expectedUsername){
				return false;
			}
			var foundUser = Meteor.call("getUserId", expectedUsername);
			return !foundUser || foundUser === userId;
		}
	}
});

if (Meteor.isServer) Meteor.methods({
	generateMyApiKey() {
		var user = Meteor.users.findOne(this.userId);
		if (!user) return;
		if (user && user.apiKey) return;
		var apiKey = Random.id(30);
		Meteor.users.update(this.userId, {$set: {apiKey}});
	},
});
