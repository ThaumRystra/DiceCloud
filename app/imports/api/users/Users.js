import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';

const userSchema = new SimpleSchema({
	username: {
		type: String,
		optional: true,
		max: 30,
		min: 4,
	},
	emails: {
		type: Array,
		optional: true,
	},
	'emails.$': {
		type: Object,
	},
	'emails.$.address': {
		type: String,
		regEx: SimpleSchema.RegEx.Email,
	},
	'emails.$.verified': {
		type: Boolean,
	},
	registered_emails: {
		type: Array,
		optional: true,
	},
	'registered_emails.$': {
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
		type: Array,
		optional: true,
	},
	'roles.$': {
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
	darkMode: {
		type: Boolean,
		optional: true,
	},
	subscribedLibraries: {
		type: Array,
		defaultValue: [],
		max: 100,
	},
	'subscribedLibraries.$': {
		type: String,
    regEx: SimpleSchema.RegEx.Id,
	},
  subscribedCharacters: {
		type: Array,
		defaultValue: [],
		max: 100,
	},
	'subscribedCharacters.$': {
		type: String,
    regEx: SimpleSchema.RegEx.Id,
	},
  profile: {
    type: Object,
    blackbox: true,
    optional: true,
  },
  preferences: {
    type: Object,
    optional: true,
    defaultValue: {},
  },
  'preferences.swapAbilityScoresAndModifiers': {
    type: Boolean,
    optional: true,
  },
});

Meteor.users.attachSchema(userSchema);

Meteor.users.generateApiKey = new ValidatedMethod({
  name: 'users.generateApiKey',
	validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run(){
		if(Meteor.isClient) return;
		var user = Meteor.users.findOne(this.userId);
		if (!user) return;
		if (user && user.apiKey) return;
		var apiKey = Random.id(30);
		Meteor.users.update(this.userId, {$set: {apiKey}});
	},
});

Meteor.users.setDarkMode = new ValidatedMethod({
  name: 'users.setDarkMode',
	validate: new SimpleSchema({
    darkMode: { type: Boolean },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({darkMode}){
		if (!this.userId) return;
		Meteor.users.update(this.userId, {$set: {darkMode}});
	},
});

Meteor.users.sendVerificationEmail = new ValidatedMethod({
	name: 'users.sendVerificationEmail',
	validate: new SimpleSchema({
		userId:{
			type: String,
			optional: true,
		},
		address: {
			type: String,
		},
	}).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
	run({userId, address}){
		userId = this.userId || userId;
		let user = Meteor.users.findOne(userId);
		if (!user) {
			throw new Meteor.Error('User not found',
				'Can\'t send a validation email to a user that does not exist');
		}
		if (!_.some(user.emails, email => email.address === address)) {
			throw new Meteor.Error('Email address not found',
				'The specified email address wasn\'t found on this user account');
		}
		Accounts.sendVerificationEmail(userId, address);
	}
});

Meteor.users.isAdmin = function(userId){
	userId = this.userId || userId;
	let user = Meteor.users.findOne(userId);
	return user && user.roles.includes('admin');
}

Meteor.users.canPickUsername = new ValidatedMethod({
	name: 'users.canPickUsername',
	validate: userSchema.pick('username').validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
	run({username}){
		if (Meteor.isClient) return;
		let user = Accounts.findUserByUsername(username);
    // You can pick your own username
    if (user && user._id === this.userId){
      return false;
    }
		return !!user;
	}
});

Meteor.users.setUsername = new ValidatedMethod({
  name: 'users.setUsername',
	validate: userSchema.pick('username').validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
	run({username}){
		if (!this.userId) throw 'Can only set your username if logged in';
    if (Meteor.isClient) return;
    return Accounts.setUsername(this.userId, username)
	}
});

Meteor.users.setPreference = new ValidatedMethod({
  name: 'users.setPreference',
	validate: new SimpleSchema({
    preference:{
      type: String,
    },
    value: {
      type: SimpleSchema.oneOf(Boolean),
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
	run({preference, value}){
		if (!this.userId) throw 'You can only set preferences once logged in';
    let prefPath = `preferences.${preference}`
    if (value == true){
      return Meteor.users.update(this.userId, {
        $set: {[prefPath]: true},
      });
    } else {
      return Meteor.users.update(this.userId, {
        $unset: {[prefPath]: 1},
      });
    }
	},
});

Meteor.users.subscribeToLibrary = new ValidatedMethod({
  name: 'users.subscribeToLibrary',
	validate: new SimpleSchema({
		libraryId:{
			type: String,
      regEx: SimpleSchema.RegEx.Id,
		},
    subscribe: {
      type: Boolean,
    },
	}).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
	run({libraryId, subscribe}){
		if (!this.userId) throw 'Can only subscribe if logged in';
    if (subscribe){
      return Meteor.users.update(this.userId, {
        $addToSet: {subscribedLibraries: libraryId},
      });
    } else {
      return Meteor.users.update(this.userId, {
        $pullAll: {subscribedLibraries: libraryId},
      });
    }
	}
});

Meteor.users.findUserByUsernameOrEmail = new ValidatedMethod({
	name: 'users.findUserByUsernameOrEmail',
	validate: new SimpleSchema({
		usernameOrEmail:{
			type: String,
		},
	}).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
	run({usernameOrEmail}){
		if (Meteor.isClient) return;
		let user = Accounts.findUserByUsername(usernameOrEmail) ||
			Accounts.findUserByEmail(usernameOrEmail);
		return user && user._id;
	}
});
