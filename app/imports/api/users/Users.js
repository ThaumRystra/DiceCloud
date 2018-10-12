Schemas.UserProfile = new SimpleSchema({
	username: {
		type: String,
		optional: true,
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

Meteor.users.gnerateApiKey = new ValidatedMethod({
  name: "Users.methods.generateApiKey",
	validate: null,
  run(){
		if(Meteor.isClient) return;
		var user = Meteor.users.findOne(this.userId);
		if (!user) return;
		if (user && user.apiKey) return;
		var apiKey = Random.id(30);
		Meteor.users.update(this.userId, {$set: {apiKey}});
	},
});

Meteor.users.sendVerificationEmail = new ValidatedMethod({
	name: "Users.methods.sendVerificationEmail",
	validate: new SimpleSchema({
		userId:{
			type: String,
			optional: true,
		},
		address: {
			type: String,
		},
	}).validator(),
	run(userId, address){
		userId = this.userId || userId;
		let user = Meteor.users.findOne();
		if (!user) {
			throw new Meteor.Error("User not found",
				"Can't send a validation email to a user that does not exist");
		}
		if (!_.some(user.emails, email => email.address === address)) {
			throw new Meteor.Error("Email address not found",
				"The specified email address wasn't found on this user account");
		}
		Accounts.sendVerificationEmail(this.userId, address);
	}
});
