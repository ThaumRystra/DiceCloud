import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import Libraries from '/imports/api/library/Libraries';
import LibraryCollections from '/imports/api/library/LibraryCollections';
import '/imports/api/users/methods/deleteMyAccount';
import '/imports/api/users/methods/addEmail';
import '/imports/api/users/methods/removeEmail';
import '/imports/api/users/methods/updateFileStorageUsed';
import { some } from 'lodash';
const defaultLibraries = process.env.DEFAULT_LIBRARIES && process.env.DEFAULT_LIBRARIES.split(',') || [];
const defaultLibraryCollections = process.env.DEFAULT_LIBRARY_COLLECTIONS && process.env.DEFAULT_LIBRARY_COLLECTIONS.split(',') || [];

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
    defaultValue: defaultLibraries,
    maxCount: 100,
  },
  'subscribedLibraries.$': {
    type: String,
    max: 32,
  },
  subscribedLibraryCollections: {
    type: Array,
    defaultValue: defaultLibraryCollections,
    maxCount: 100,
  },
  'subscribedLibraryCollections.$': {
    type: String,
    max: 32,
  },
  subscribedCharacters: {
    type: Array,
    defaultValue: [],
    max: 100,
  },
  'subscribedCharacters.$': {
    type: String,
    max: 32,
  },
  fileStorageUsed: {
    type: Number,
    optional: true,
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
  'preferences.hidePropertySelectDialogHelp': {
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
  run() {
    if (Meteor.isClient) return;
    var user = Meteor.users.findOne(this.userId);
    if (!user) return;
    if (user && user.apiKey) return;
    var apiKey = Random.id(30);
    Meteor.users.update(this.userId, { $set: { apiKey } });
  },
});

Meteor.users.setDarkMode = new ValidatedMethod({
  name: 'users.setDarkMode',
  validate: new SimpleSchema({
    darkMode: { type: Boolean, optional: true },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 2000,
  },
  run({ darkMode }) {
    if (!this.userId) return;
    Meteor.users.update(this.userId, { $set: { darkMode } });
  },
});

Meteor.users.sendVerificationEmail = new ValidatedMethod({
  name: 'users.sendVerificationEmail',
  validate: new SimpleSchema({
    userId: {
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
  run({ userId, address }) {
    userId = this.userId || userId;
    let user = Meteor.users.findOne(userId);
    if (!user) {
      throw new Meteor.Error('User not found',
        'Can\'t send a validation email to a user that does not exist');
    }
    if (!some(user.emails, email => email.address === address)) {
      throw new Meteor.Error('Email address not found',
        'The specified email address wasn\'t found on this user account');
    }
    Accounts.sendVerificationEmail(userId, address);
  }
});

Meteor.users.canPickUsername = new ValidatedMethod({
  name: 'users.canPickUsername',
  validate: userSchema.pick('username').validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({ username }) {
    if (Meteor.isClient) return;
    let user = Accounts.findUserByUsername(username);
    // You can pick your own username
    if (user && user._id === this.userId) {
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
  run({ username }) {
    if (!this.userId) throw 'Can only set your username if logged in';
    if (Meteor.isClient) return;
    return Accounts.setUsername(this.userId, username)
  }
});

Meteor.users.setPreference = new ValidatedMethod({
  name: 'users.setPreference',
  validate: new SimpleSchema({
    preference: {
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
  run({ preference, value }) {
    if (!this.userId) throw 'You can only set preferences once logged in';
    let prefPath = `preferences.${preference}`
    if (value == true) {
      return Meteor.users.update(this.userId, {
        $set: { [prefPath]: true },
      });
    } else {
      return Meteor.users.update(this.userId, {
        $unset: { [prefPath]: 1 },
      });
    }
  },
});

if (Meteor.isServer) {
  Accounts.onCreateUser((options, user) => {
    if (defaultLibraries?.length) {
      Libraries.update({
        _id: { $in: defaultLibraries }
      }, {
        $inc: { subscriberCount: 1 }
      }, {
        multi: true,
      }, () => {/**/ });
    }
    if (defaultLibraryCollections?.length) {
      LibraryCollections.update({
        _id: { $in: defaultLibraryCollections }
      }, {
        $inc: { subscriberCount: 1 }
      }, {
        multi: true,
      }, () => {/**/ });
    }
    return user;
  });
}

Meteor.users.subscribeToLibrary = new ValidatedMethod({
  name: 'users.subscribeToLibrary',
  validate: new SimpleSchema({
    libraryId: {
      type: String,
      max: 32,
    },
    subscribe: {
      type: Boolean,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 2000,
  },
  run({ libraryId, subscribe }) {
    if (!this.userId) throw 'Can only subscribe if logged in';
    if (subscribe) {
      Libraries.update({ _id: libraryId }, { $inc: { subscriberCount: 1 } }, () => {/**/ });
      return Meteor.users.update(this.userId, {
        $addToSet: { subscribedLibraries: libraryId },
      });
    } else {
      Libraries.update({ _id: libraryId }, { $inc: { subscriberCount: -1 } }, () => {/**/ });
      return Meteor.users.update(this.userId, {
        $pullAll: { subscribedLibraries: libraryId },
      });
    }
  }
});

Meteor.users.subscribeToLibraryCollection = new ValidatedMethod({
  name: 'users.subscribeToLibraryCollection',
  validate: new SimpleSchema({
    libraryCollectionId: {
      type: String,
      max: 32,
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
  run({ libraryCollectionId, subscribe }) {
    if (!this.userId) throw 'Can only subscribe if logged in';
    if (subscribe) {
      LibraryCollections.update({ _id: libraryCollectionId }, { $inc: { subscriberCount: 1 } }, () => {/**/ });
      return Meteor.users.update(this.userId, {
        $addToSet: { subscribedLibraryCollections: libraryCollectionId },
      });
    } else {
      LibraryCollections.update({ _id: libraryCollectionId }, { $inc: { subscriberCount: -1 } }, () => {/**/ });
      return Meteor.users.update(this.userId, {
        $pullAll: { subscribedLibraryCollections: libraryCollectionId },
      });
    }
  }
});

Meteor.users.findUserByUsernameOrEmail = new ValidatedMethod({
  name: 'users.findUserByUsernameOrEmail',
  validate: new SimpleSchema({
    usernameOrEmail: {
      type: String,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({ usernameOrEmail }) {
    if (Meteor.isClient) return;
    let user = Accounts.findUserByUsername(usernameOrEmail) ||
      Accounts.findUserByEmail(usernameOrEmail);
    return user && user._id;
  }
});
