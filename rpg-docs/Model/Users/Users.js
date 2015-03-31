Schema = {};

Schema.User = new SimpleSchema({
	username: {
		type: String,
		regEx: /^[a-z0-9A-Z_]{3,15}$/,
		optional: true
	},
	emails: {
		type: [Object],
		// this must be optional if you also use other login services like facebook,
		// but if you use only accounts-password, then it can be required
		optional: true
	},
	"emails.$.address": {
		type: String,
		regEx: SimpleSchema.RegEx.Email
	},
	"emails.$.verified": {
		type: Boolean
	},
	createdAt: {
		type: Date
	},
	services: {
		type: Object,
		optional: true,
		blackbox: true
	},
	roles: {
		type: [String],
		optional: true
	}
});

Meteor.users.attachSchema(Schema.User);

Meteor.users.allow({
	update: function (userId, doc, fields, modifier) {
		return userId === doc._id &&
			fields.length === 1 &&
			fields[0] === 'username';
	}
});
