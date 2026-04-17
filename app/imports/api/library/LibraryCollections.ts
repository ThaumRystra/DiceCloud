import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import SharingSchema from '/imports/api/sharing/SharingSchema';
import { assertEditPermission, assertOwnership } from '/imports/api/sharing/sharingPermissions';
import { getUserTierAsync } from '/imports/api/users/patreon/tiers'
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { TypedSimpleSchema, type InferType } from '/imports/api/utility/TypedSimpleSchema';

const BaseLibraryCollectionSchema = TypedSimpleSchema.from({
  _id: {
    type: String,
    max: 32,
  },
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
    type: Boolean,
    optional: true,
  },
  subscriberCount: {
    type: Number,
    optional: true,
  },
});

const LibraryCollectionSchema = BaseLibraryCollectionSchema.extend(SharingSchema);

type LibraryCollection = InferType<typeof LibraryCollectionSchema>;

/**
 * LibraryCollections are groups of libraries that are subscribed together at once
 */
const LibraryCollections = new Mongo.Collection<LibraryCollection>('libraryCollections');


LibraryCollections.attachSchema(LibraryCollectionSchema);

export default LibraryCollections;

const insertLibraryCollection = new ValidatedMethod({
  name: 'libraryCollections.insert',
  validate: LibraryCollectionSchema.omit('owner', '_id').validator(),
  async run(libraryCollection) {
    if (!this.userId) {
      throw new Meteor.Error('LibraryCollections.methods.insert.denied',
        'You need to be logged in to insert a library');
    }
    const tier = await getUserTierAsync(this.userId);
    if (!tier.paidBenefits) {
      throw new Meteor.Error('LibraryCollections.methods.insert.denied',
        `The ${tier.name} tier does not allow you to insert a library collection`);
    }
    return await LibraryCollections.insertAsync({
      ...libraryCollection,
      owner: this.userId,
    });
  },
});

const updateLibraryCollection = new ValidatedMethod({
  name: 'libraryCollections.update',
  validate: TypedSimpleSchema.from({
    _id: {
      type: String,
      max: 32,
    },
    update: {
      type: LibraryCollectionSchema
        .pick('name', 'description', 'showInMarket')
        .extend(TypedSimpleSchema.from({ //make libraries optional
          libraries: {
            type: Array,
            maxCount: STORAGE_LIMITS.libraryCollectionCount,
            optional: true,
            defaultValue: undefined,
          },
          'libraries.$': {
            type: String,
            max: 32,
          },
        })),
    }
  }).validator(),
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ _id, update }) {
    const libraryCollection = await LibraryCollections.findOneAsync(_id, {
      fields: {
        owner: 1,
        writers: 1,
      }
    });
    await assertEditPermission(libraryCollection, this.userId);
    return await LibraryCollections.updateAsync(_id, { $set: update });
  },
});

const removeLibraryCollection = new ValidatedMethod({
  name: 'libraryCollections.remove',
  validate: TypedSimpleSchema.from({
    _id: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ _id }) {
    const libraryCollection = await LibraryCollections.findOneAsync(_id, {
      fields: {
        owner: 1,
      }
    });
    assertOwnership(libraryCollection, this.userId);
    return await LibraryCollections.removeAsync(_id);
  }
});

async function getLibraryIdsByCollectionId(libraryCollectionId: string) {
  const libraryCollection = await LibraryCollections.findOneAsync(libraryCollectionId)
  return libraryCollection?.libraries || [];
}

export {
  LibraryCollectionSchema,
  insertLibraryCollection,
  updateLibraryCollection,
  removeLibraryCollection,
  getLibraryIdsByCollectionId,
};
