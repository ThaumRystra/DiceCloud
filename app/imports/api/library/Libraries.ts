import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import {
  assertEditPermission,
  assertOwnership,
} from '/imports/api/sharing/sharingPermissions';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import { getUserTierAsync } from '/imports/api/users/patreon/tiers';
import { getFilter } from '/imports/api/parenting/parentingFunctions';
import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import SharingSchema from '/imports/api/sharing/sharing.schema';

export const baseLibrarySchema = z.object({
  _id: z.string().max(32).brand('LibraryId'),
  name: z.string().max(STORAGE_LIMITS.name),
  description: z.string().max(STORAGE_LIMITS.summary).optional(),
  showInMarket: z.boolean().optional(),
  subscriberCount: z.number().optional(),
});

export const librarySchema = z.object({
  ...baseLibrarySchema.shape,
  ...SharingSchema.shape,
});

export type Library = z.infer<typeof librarySchema>;

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
Libraries.attachSchema(librarySchema);

export default Libraries;

const insertLibrary = new ValidatedMethod({
  name: 'libraries.insert',
  validate: null,
  async run(libraryInput: unknown) {
    const library = librarySchema
      .omit({ _id: true, owner: true })
      .parse(libraryInput);
    if (!this.userId) {
      throw new Meteor.Error(
        'Libraries.methods.insert.denied',
        'You need to be logged in to insert a library',
      );
    }
    const tier = await getUserTierAsync(this.userId);
    if (!tier.paidBenefits) {
      throw new Meteor.Error(
        'Libraries.methods.insert.denied',
        `The ${tier.name} tier does not allow you to insert a library`,
      );
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
      regEx: SimpleSchema.RegEx.Id,
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
  async run({ _id, name }: { _id: string; name: string }) {
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
      regEx: SimpleSchema.RegEx.Id,
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
  async run({ _id, description }: { _id: string; description: string }) {
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
      regEx: SimpleSchema.RegEx.Id,
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
  async run({ _id, value }: { _id: string; value: boolean }) {
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
      regEx: SimpleSchema.RegEx.Id,
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
    await removeLibaryWork(_id);
  },
});

export async function removeLibaryWork(libraryId: string) {
  await Libraries.removeAsync(libraryId);
  await LibraryNodes.removeAsync(getFilter.descendantsOfRoot(libraryId));
}

export {
  LibrarySchema,
  insertLibrary,
  updateLibraryName,
  updateLibraryDescription,
  updateLibraryShowInMarket,
  removeLibrary,
};
