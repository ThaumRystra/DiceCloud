import SimpleSchema from 'simpl-schema';
import { updateParent } from '/imports/api/parenting/parenting.js';
import { insertedDocAtOrder, removedDocAtOrder, updateDocOrder } from '/imports/api/parenting/order.js';
import { RefSchema } from '/imports/api/parenting/ChildSchema.js';
import { assertDocEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import fetchDocByRef from '/imports/api/parenting/fetchDocByRef.js';
import getCollectionByName from '/imports/api/parenting/getCollectionByName.js';

const organizeDoc = new ValidatedMethod({
  name: 'organize.methods.organizeDoc',
  validate: new SimpleSchema({
    docRef: RefSchema,
    parentRef: RefSchema,
    order: {
      type: Number,
      min: 0,
    },
  }).validator(),
  run({docRef, parentRef, order}) {
    let doc = fetchDocByRef(docRef);
    let collection = getCollectionByName(docRef.collection);
    // The user must be able to edit both the doc and its parent to move it
    // successfully
    assertDocEditPermission(doc, this.userId);
    let parent = fetchDocByRef(parentRef);
    assertDocEditPermission(parent, this.userId);

    // Reorder the documents in the doc's old parent
    removedDocAtOrder({collection, doc});
    // Reorder the docs in the destination parent
    insertedDocAtOrder({collection, parentId: parentRef.id, order});
    // Change the doc's parent
    updateParent({docRef, parentRef});
    // Change the doc's order
    collection.update(doc._id, {$set: {order}}, {selector: {type: 'any'}});
  },
});

const reorderDoc = new ValidatedMethod({
  name: 'organize.methods.reorderDoc',
  validate: new SimpleSchema({
    docRef: RefSchema,
    order: {
      type: Number,
      min: 0,
    },
  }).validator(),
  run({docRef, order}) {
    let doc = fetchDocByRef(docRef);
    assertDocEditPermission(doc, this.userId);
    updateDocOrder({docRef, order})
  },
});

export { organizeDoc, reorderDoc };
