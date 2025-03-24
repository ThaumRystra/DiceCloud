import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import SharingSchema from '/imports/api/sharing/SharingSchema';
import simpleSchemaMixin from '/imports/api/creature/mixins/simpleSchemaMixin';
import { assertEditPermission, assertOwnership } from '/imports/api/sharing/sharingPermissions';
import { getUserTier } from '/imports/api/users/patreon/tiers'
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';

/**
 * LibraryCollections are groups of libraries that are subscribed together at once
 */
const LibraryCollections = new Mongo.Collection('libraryCollections');

const LibraryCollectionSchema = new SimpleSchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  description: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.summary,
  },
  libraries: {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.libraryCollectionCount,
  },
  'libraries.$': {
    type: String,
    max: 32,
  },
  showInMarket: {
    index: 1,
    type: Boolean,
    optional: true,
  },
  subscriberCount: {
    index: 1,
    type: Number,
    optional: true,
  },
});

LibraryCollectionSchema.extend(SharingSchema);
LibraryCollections.attachSchema(LibraryCollectionSchema);

export default LibraryCollections;

const insertLibraryCollection = new ValidatedMethod({
  name: 'libraryCollections.insert',
  mixins: [
    simpleSchemaMixin,
  ],
  schema: LibraryCollectionSchema.omit('owner'),
  run(libraryCollection) {
    if (!this.userId) {
      throw new Meteor.Error('LibraryCollections.methods.insert.denied',
        'You need to be logged in to insert a library');
    }
    let tier = getUserTier(this.userId);
    if (!tier.paidBenefits) {
      throw new Meteor.Error('LibraryCollections.methods.insert.denied',
        `The ${tier.name} tier does not allow you to insert a library collection`);
    }
    libraryCollection.owner = this.userId;
    return LibraryCollections.insert(libraryCollection);
  },
});

const updateLibraryCollection = new ValidatedMethod({
  name: 'libraryCollections.update',
  mixins: [
    simpleSchemaMixin,
  ],
  schema: {
    _id: {
      type: String,
      max: 32,
    },
    update: {
      type: LibraryCollectionSchema
        .pick('name', 'description', 'libraries', 'showInMarket')
        .extend({ //make libraries optional
          libraries: {
            optional: true,
            defaultValue: undefined,
          },
        }),
    }
  },
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({ _id, update }) {
    const libraryCollection = LibraryCollections.findOne(_id, {
      fields: {
        owner: 1,
        writers: 1,
      }
    });
    assertEditPermission(libraryCollection, this.userId);
    return LibraryCollections.update(_id, { $set: update });
  },
});

const removeLibraryCollection = new ValidatedMethod({
  name: 'libraryCollections.remove',
  validate: new SimpleSchema({
    _id: {
      type: String,
      regEx: SimpleSchema.RegEx.id
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({ _id }) {
    const libraryCollection = LibraryCollections.findOne(_id, {
      fields: {
        owner: 1,
      }
    });
    assertOwnership(libraryCollection, this.userId);
    return LibraryCollections.remove(_id);
  }
});

function getLibraryIdsByCollectionId(libraryCollectionId) {
  const libraryCollection = LibraryCollections.findOne(libraryCollectionId)
  return libraryCollection?.libraries || [];
}

export {
  LibraryCollectionSchema,
  insertLibraryCollection,
  updateLibraryCollection,
  removeLibraryCollection,
  getLibraryIdsByCollectionId,
};
