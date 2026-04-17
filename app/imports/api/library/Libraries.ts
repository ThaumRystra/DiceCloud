import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import SharingSchema from '/imports/api/sharing/SharingSchema';
import { assertEditPermission, assertOwnership } from '/imports/api/sharing/sharingPermissions';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import { getUserTierAsync } from '/imports/api/users/patreon/tiers'
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { getFilter } from '/imports/api/parenting/parentingFunctions';
import { TypedSimpleSchema, type InferType } from '/imports/api/utility/TypedSimpleSchema';

const BaseLibrarySchema = TypedSimpleSchema.from({
  _id: {
    type: String,
    max: 32,
  },
  name: {
    type: String,
    max: STORAGE_LIMITS.name,
  },
  description: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.summary,
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

const LibrarySchema = BaseLibrarySchema.extend(SharingSchema);

export type Library = InferType<typeof LibrarySchema>

/**
 * Libraries are trees of library nodes where each node represents a character
 * property.
 *
 * Libraries can be shared, have multiple readers and writers, and can be
 * subscribed to.
 *
 * Permissions to library nodes are controlled by the libraries they belong to.
 */
const Libraries = new Mongo.Collection<Library>('libraries');
Libraries.attachSchema(LibrarySchema);

export default Libraries;

const insertLibrary = new ValidatedMethod({
  name: 'libraries.insert',
  validate: LibrarySchema.omit('owner', '_id').validator(),
  async run(library) {
    if (!this.userId) {
      throw new Meteor.Error('Libraries.methods.insert.denied',
        'You need to be logged in to insert a library');
    }
    const tier = await getUserTierAsync(this.userId);
    if (!tier.paidBenefits) {
      throw new Meteor.Error('Libraries.methods.insert.denied',
        `The ${tier.name} tier does not allow you to insert a library`);
    }
    return await Libraries.insertAsync({
      ...library,
      owner: this.userId,
    });
  },
});

const updateLibraryName = new ValidatedMethod({
  name: 'libraries.updateName',
  validate: new SimpleSchema({
    _id: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    name: {
      type: String,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ _id, name }: { _id: string, name: string }) {
    const library = await Libraries.findOneAsync(_id);
    await assertEditPermission(library, this.userId);
    await Libraries.updateAsync(_id, { $set: { name } });
  },
});

const updateLibraryDescription = new ValidatedMethod({
  name: 'libraries.updateDescription',
  validate: new SimpleSchema({
    _id: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    description: {
      type: String,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ _id, description }: { _id: string, description: string }) {
    const library = await Libraries.findOneAsync(_id);
    await assertEditPermission(library, this.userId);
    await Libraries.updateAsync(_id, { $set: { description } });
  },
});

const updateLibraryShowInMarket = new ValidatedMethod({
  name: 'libraries.updateShowInMarket',
  validate: new SimpleSchema({
    _id: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    value: {
      type: Boolean,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ _id, value }: { _id: string, value: boolean }) {
    const library = await Libraries.findOneAsync(_id);
    await assertEditPermission(library, this.userId);
    await Libraries.updateAsync(_id, { $set: { showInMarket: value } });
  },
});

const removeLibrary = new ValidatedMethod({
  name: 'libraries.remove',
  validate: new SimpleSchema({
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
  async run({ _id }: { _id: string }) {
    const library = await Libraries.findOneAsync(_id);
    assertOwnership(library, this.userId);
    this.unblock();
    await removeLibaryWork(_id)
  }
});

export async function removeLibaryWork(libraryId: string) {
  await Libraries.removeAsync(libraryId);
  await LibraryNodes.removeAsync(getFilter.descendantsOfRoot(libraryId));
}

export { LibrarySchema, insertLibrary, updateLibraryName, updateLibraryDescription, updateLibraryShowInMarket, removeLibrary };
