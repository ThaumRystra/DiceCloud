import SimpleSchema from 'simpl-schema';
import { assertOwnership } from '/imports/api/sharing/sharingPermissions.js';
import fetchDocByRef from '/imports/api/parenting/fetchDocByRef.js';
import getCollectionByName from '/imports/api/parenting/getCollectionByName.js';
import { RefSchema } from '/imports/api/parenting/ChildSchema.js';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

const setPublic = new ValidatedMethod({
  name: 'sharing.methods.setPublic',
	validate: new SimpleSchema({
		docRef: RefSchema,
    isPublic: { type: Boolean },
  }).validator(),
  run({docRef, isPublic}){
		let doc = fetchDocByRef(docRef);
		assertOwnership(doc, this.userId);
		return getCollectionByName(docRef.collection).update(docRef.id, {
      $set: {public: isPublic},
    });
	},
});

const updateUserSharePermissions = new ValidatedMethod({
  name: 'sharing.methods.updateUserSharePermissions',
	validate: new SimpleSchema({
		docRef: RefSchema,
    userId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
    role: {
      type: String,
      allowedValues: ['reader', 'writer', 'none'],
    },
  }).validator(),
  run({docRef, userId, role}){
		let doc = fetchDocByRef(docRef);
    if (role === 'none'){
      // only asser ownership if you aren't removing yourself
      if (this.userId !== userId){
        assertOwnership(doc, this.userId);
      }
      return getCollectionByName(docRef.collection).update(docRef.id, {
        $pullAll: { readers: userId, writers: userId },
      });
    }
    if (doc.owner === userId){
      throw new Meteor.Error('Sharing update failed',
      'User is already the owner of this document');
    }
    assertOwnership(doc, this.userId);
    if (role === 'reader'){
      return getCollectionByName(docRef.collection).update(docRef.id, {
        $addToSet: { readers: userId },
        $pullAll: { writers: userId },
      });
    } else if (role === 'writer'){
      return getCollectionByName(docRef.collection).update(docRef.id, {
        $addToSet: { writers: userId },
        $pullAll: { readers: userId },
      });
    }
	},
});

export { setPublic, updateUserSharePermissions };
