import SimpleSchema from 'simpl-schema';
import { assertOwnership } from '/imports/api/sharing/sharingPermissions.js';
import fetchDocByRef from '/imports/api/parenting/fetchDocByRef.js';
import getCollectionByName from '/imports/api/parenting/getCollectionByName.js';
import { RefSchema } from '/imports/api/parenting/ChildSchema.js';

const setPublic = new ValidatedMethod({
  name: 'sharing.methods.setPublic',
	validate: new SimpleSchema({
		docRef: RefSchema,
    public: { type: Boolean },
  }).validator(),
  run({docRef, public}){
		let doc = fetchDocByRef(docRef);
		assertOwnership(doc, this.userId);
		getCollectionByName(docRef.collection).update(docRef.id, {$set: {public}});
	},
});

export { setPublic };
