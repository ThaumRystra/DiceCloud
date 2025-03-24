import SimpleSchema from 'simpl-schema';
import { assertOwnership } from '/imports/api/sharing/sharingPermissions';
import { getCollectionByName, fetchDocByRef } from '/imports/api/parenting/parentingFunctions';
import { RefSchema } from '/imports/api/parenting/ChildSchema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { getUserTier } from '/imports/api/users/patreon/tiers';

const setPublic = new ValidatedMethod({
  name: 'sharing.setPublic',
  validate: new SimpleSchema({
    docRef: RefSchema,
    isPublic: { type: Boolean },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({ docRef, isPublic }) {
    let doc = fetchDocByRef(docRef);
    assertOwnership(doc, this.userId);
    return getCollectionByName(docRef.collection).update(docRef.id, {
      $set: { public: isPublic },
    });
  },
});

const setReadersCanCopy = new ValidatedMethod({
  name: 'sharing.setReadersCanCopy',
  validate: new SimpleSchema({
    docRef: RefSchema,
    readersCanCopy: { type: Boolean },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({ docRef, readersCanCopy }) {
    let doc = fetchDocByRef(docRef);
    assertOwnership(doc, this.userId);
    return getCollectionByName(docRef.collection).update(docRef.id, {
      $set: { readersCanCopy },
    });
  },
});

const updateUserSharePermissions = new ValidatedMethod({
  name: 'sharing.updateUserSharePermissions',
  validate: new SimpleSchema({
    docRef: RefSchema,
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
  run({ docRef, userId, role }) {
    let doc = fetchDocByRef(docRef);
    if (role === 'none') {
      // only assert ownership if you aren't removing yourself
      if (this.userId !== userId) {
        assertOwnership(doc, this.userId);
      }
      return getCollectionByName(docRef.collection).update(docRef.id, {
        $pullAll: { readers: userId, writers: userId },
      });
    }
    if (doc.owner === userId) {
      throw new Meteor.Error('Sharing update failed',
        'User is already the owner of this document');
    }
    assertOwnership(doc, this.userId);
    if (role === 'reader') {
      return getCollectionByName(docRef.collection).update(docRef.id, {
        $addToSet: { readers: userId },
        $pullAll: { writers: userId },
      });
    } else if (role === 'writer') {
      return getCollectionByName(docRef.collection).update(docRef.id, {
        $addToSet: { writers: userId },
        $pullAll: { readers: userId },
      });
    }
  },
});

const transferOwnership = new ValidatedMethod({
  name: 'sharing.transferOwnership',
  validate: new SimpleSchema({
    docRef: RefSchema,
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
  run({ docRef, userId }) {
    let doc = fetchDocByRef(docRef);
    assertOwnership(doc, this.userId);

    let collection = getCollectionByName(docRef.collection);

    let tier = getUserTier(userId);
    if (docRef.collection === 'creatures') {
      let currentCharacterCount = collection.find({
        owner: userId,
      }, {
        fields: { _id: 1 },
      }).count();

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
    collection.update(docRef.id, {
      $pullAll: { writers: userId, readers: userId },
    });
    // Then make the user the owner and the current owner a writer
    return collection.update(docRef.id, {
      $set: { owner: userId },
      $addToSet: { writers: this.userId },
    });
  },
});

export { setPublic, setReadersCanCopy, updateUserSharePermissions, transferOwnership };
