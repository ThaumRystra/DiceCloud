import { assertOwnership } from '/imports/api/sharing/sharingPermissions';
import { getCollectionByName } from '/imports/api/parenting/parentingFunctions';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { getUserTierAsync } from '/imports/api/users/patreon/tiers';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { getDocByRefAsync } from '/imports/api/parenting/reference';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

const sharableCollections = ['libraries' as const, 'creatures' as const];

const sharableCollectionReference = TypedSimpleSchema.from({
  id: {
    type: String,
    max: 32,
  },
  collection: {
    type: String,
    max: STORAGE_LIMITS.collectionName,
    allowedValues: sharableCollections,
  },
})

const setPublic = new ValidatedMethod({
  name: 'sharing.setPublic',
  validate: TypedSimpleSchema.from({
    docRef: {
      type: sharableCollectionReference,
    },
    isPublic: { type: Boolean },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ docRef, isPublic }) {
    const doc = await getDocByRefAsync(docRef);
    assertOwnership(doc, this.userId);
    return await getCollectionByName(docRef.collection).updateAsync(docRef.id, {
      $set: { public: isPublic },
    });
  },
});

const setReadersCanCopy = new ValidatedMethod({
  name: 'sharing.setReadersCanCopy',
  validate: TypedSimpleSchema.from({
    docRef: {
      type: sharableCollectionReference
    },
    readersCanCopy: { type: Boolean },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ docRef, readersCanCopy }) {
    const doc = await getDocByRefAsync(docRef);
    assertOwnership(doc, this.userId);
    return await getCollectionByName(docRef.collection).updateAsync(docRef.id, {
      $set: { readersCanCopy },
    });
  },
});

const updateUserSharePermissions = new ValidatedMethod({
  name: 'sharing.updateUserSharePermissions',
  validate: TypedSimpleSchema.from({
    docRef: {
      type: sharableCollectionReference,
    },
    userId: {
      type: String,
      max: 32,
    },
    role: {
      type: String,
      allowedValues: ['reader', 'writer', 'none'],
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ docRef, userId, role }) {
    const doc = await getDocByRefAsync(docRef);
    if (role === 'none') {
      // only assert ownership if you aren't removing yourself
      if (this.userId !== userId) {
        assertOwnership(doc, this.userId);
      }
      return await getCollectionByName(docRef.collection).updateAsync(docRef.id, {
        $pullAll: { readers: userId, writers: userId },
      });
    }
    if (doc?.owner === userId) {
      throw new Meteor.Error('Sharing update failed',
        'User is already the owner of this document');
    }
    assertOwnership(doc, this.userId);
    if (role === 'reader') {
      return await getCollectionByName(docRef.collection).updateAsync(docRef.id, {
        $addToSet: { readers: userId },
        $pullAll: { writers: userId },
      });
    } else if (role === 'writer') {
      return await getCollectionByName(docRef.collection).updateAsync(docRef.id, {
        $addToSet: { writers: userId },
        $pullAll: { readers: userId },
      });
    }
  },
});

const transferOwnership = new ValidatedMethod({
  name: 'sharing.transferOwnership',
  validate: TypedSimpleSchema.from({
    docRef: {
      type: sharableCollectionReference,
    },
    userId: {
      type: String,
      max: 32,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ docRef, userId }) {
    const doc = await getDocByRefAsync(docRef);
    assertOwnership(doc, this.userId);

    const collection = getCollectionByName(docRef.collection);

    const tier = await getUserTierAsync(userId);
    if (docRef.collection === 'creatures') {
      const currentCharacterCount = await collection.find({
        owner: userId,
      }, {
        fields: { _id: 1 },
      }).countAsync();

      if (
        tier.characterSlots !== -1 &&
        currentCharacterCount >= tier.characterSlots
      ) {
        throw new Meteor.Error('Sharing.methods.transferOwnership.denied',
          'The new owner is already at their character limit')
      }
    } else if (docRef.collection === 'libraries') {
      if (!tier.paidBenefits) {
        throw new Meteor.Error('Sharing.methods.transferOwnership.denied',
          'The new owner\'s Patreon tier does not have access to library ownership');
      }
    }

    // First remove current permissions for the user
    await collection.updateAsync(docRef.id, {
      $pullAll: { writers: userId, readers: userId },
    });
    // Then make the user the owner and the current owner a writer
    return await collection.updateAsync(docRef.id, {
      $set: { owner: userId },
      $addToSet: { writers: this.userId },
    });
  },
});

export { setPublic, setReadersCanCopy, updateUserSharePermissions, transferOwnership };
