import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { Roles } from 'meteor/roles';
import Libraries from '/imports/api/library/Libraries';
import LibraryCollections from '/imports/api/library/LibraryCollections';
import '/imports/api/users/methods/deleteMyAccount';
import '/imports/api/users/methods/addEmail';
import '/imports/api/users/methods/removeEmail';
import '/imports/api/users/methods/updateFileStorageUsed';
import { some } from 'lodash';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';
const defaultLibraries = process.env.DEFAULT_LIBRARIES && process.env.DEFAULT_LIBRARIES.split(',') || [];
const defaultLibraryCollections = process.env.DEFAULT_LIBRARY_COLLECTIONS && process.env.DEFAULT_LIBRARY_COLLECTIONS.split(',') || [];

// Roles
await Roles.createRoleAsync('contributor');
await Roles.createRoleAsync('admin');

// Permissions
await Roles.createRoleAsync('DOCS_EDIT');

// Hierarchy
await Roles.addRolesToParentAsync('DOCS_EDIT', 'admin');
await Roles.addRolesToParentAsync('DOCS_EDIT', 'contributor');

const userSchema = TypedSimpleSchema.from({
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
  // In order to avoid an 'Exception in setInterval callback' from Meteor
  heartbeat: {
    type: Date,
    optional: true,
  },
  apiKey: {
    type: String,
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

export const generateApiKey = new ValidatedMethod({
  name: 'users.generateApiKey',
  validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run() {
    if (Meteor.isClient) return;
    if (!this.userId) {
      throw new Meteor.Error('logged-out',
        'You must be logged in to generate an API key'
      )
    }
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user) return;
    if (user && user.apiKey) return;
    const apiKey = Random.id(30);
    await Meteor.users.updateAsync(this.userId, { $set: { apiKey } });
  },
});

export const setDarkMode = new ValidatedMethod({
  name: 'users.setDarkMode',
  validate: new SimpleSchema({
    darkMode: { type: Boolean, optional: true },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 2000,
  },
  async run({ darkMode }: { darkMode: boolean }) {
    if (!this.userId) return;
    await Meteor.users.updateAsync(this.userId, { $set: { darkMode } });
  },
});

export const sendVerificationEmail = new ValidatedMethod({
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
  async run({ userId, address }: { userId?: string, address: string }) {
    if (!this.userId) {
      throw new Meteor.Error('logged-out', 'you must be logged in to perform this action')
    }
    if (userId && userId !== this.userId) {
      const isAdmin = await Roles.userIsInRoleAsync(this.userId, 'admin');
      if (!isAdmin) {
        throw new Meteor.Error('permission-denied',
          'Only admins may send verification emails on behalf of other users'
        );
      }
    }
    userId = userId || this.userId;
    const user = await Meteor.users.findOneAsync(userId);
    if (!user) {
      throw new Meteor.Error('User not found',
        'Can\'t send a validation email to a user that does not exist');
    }
    if (!some(user.emails, email => email.address === address)) {
      throw new Meteor.Error('Email address not found',
        'The specified email address wasn\'t found on this user account');
    }
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await Accounts.sendVerificationEmail(userId, address);
  }
});

export const canPickUsername = new ValidatedMethod({
  name: 'users.canPickUsername',
  validate: userSchema.pick('username').validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({ username }: { username: string }) {
    if (Meteor.isClient) return;
    const user = Accounts.findUserByUsername(username, { fields: { _id: 1 } });
    // You can pick your own username
    if (user && user._id === this.userId) {
      return false;
    }
    return !!user;
  }
});

export const setUsername = new ValidatedMethod({
  name: 'users.setUsername',
  validate: userSchema.pick('username').validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({ username }: { username: string }) {
    if (!this.userId) throw new Meteor.Error('logged-out', 'Can only set your username if logged in');
    if (Meteor.isClient) return;
    return Accounts.setUsername(this.userId, username)
  }
});

export const setPreference = new ValidatedMethod({
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
  async run({ preference, value }) {
    if (!this.userId) throw new Meteor.Error('logged-out', 'You can only set preferences once logged in');
    const prefPath = `preferences.${preference}`
    if (value == true) {
      return await Meteor.users.updateAsync(this.userId, {
        $set: { [prefPath]: true },
      });
    } else {
      return await Meteor.users.updateAsync(this.userId, {
        $unset: { [prefPath]: 1 },
      });
    }
  },
});

if (Meteor.isServer) {
  Accounts.onCreateUser((options, user) => {
    if (defaultLibraries?.length) {
      void Libraries.updateAsync({
        _id: { $in: defaultLibraries }
      }, {
        $inc: { subscriberCount: 1 }
      }, {
        multi: true,
      });
    }
    if (defaultLibraryCollections?.length) {
      void LibraryCollections.updateAsync({
        _id: { $in: defaultLibraryCollections }
      }, {
        $inc: { subscriberCount: 1 }
      }, {
        multi: true,
      });
    }
    return user;
  });
}

export const subscribeToLibrary = new ValidatedMethod({
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
  async run({ libraryId, subscribe }: { libraryId: string, subscribe: boolean }) {
    if (!this.userId) throw new Meteor.Error('logged-out', 'Can only subscribe if logged in');
    if (subscribe) {
      await Libraries.updateAsync({ _id: libraryId }, { $inc: { subscriberCount: 1 } });
      return await Meteor.users.updateAsync(this.userId, {
        $addToSet: { subscribedLibraries: libraryId },
      });
    } else {
      await Libraries.updateAsync({ _id: libraryId }, { $inc: { subscriberCount: -1 } });
      return await Meteor.users.updateAsync(this.userId, {
        $pull: { subscribedLibraries: libraryId },
      });
    }
  }
});

export const subscribeToLibraryCollection = new ValidatedMethod({
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
  async run({ libraryCollectionId, subscribe }: { libraryCollectionId: string, subscribe: boolean }) {
    if (!this.userId) throw new Meteor.Error('logged-out', 'Can only subscribe if logged in');
    if (subscribe) {
      await LibraryCollections.updateAsync({ _id: libraryCollectionId }, { $inc: { subscriberCount: 1 } });
      return await Meteor.users.updateAsync(this.userId, {
        $addToSet: { subscribedLibraryCollections: libraryCollectionId },
      });
    } else {
      await LibraryCollections.updateAsync({ _id: libraryCollectionId }, { $inc: { subscriberCount: -1 } });
      return await Meteor.users.updateAsync(this.userId, {
        $pull: { subscribedLibraryCollections: libraryCollectionId },
      });
    }
  }
});

export const findUserByUsernameOrEmail = new ValidatedMethod({
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
  run({ usernameOrEmail }: { usernameOrEmail: string }) {
    if (Meteor.isClient) return;
    const user = Accounts.findUserByUsername(usernameOrEmail) ||
      Accounts.findUserByEmail(usernameOrEmail);
    return user && user._id;
  }
});
