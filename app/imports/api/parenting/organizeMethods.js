import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { updateParent } from '/imports/api/parenting/parenting.js';
import { reorderDocs, safeUpdateDocOrder } from '/imports/api/parenting/order.js';
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
      // Should end in 0.5 to place it reliably between two existing documents
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

    // Change the doc's parent
    updateParent({docRef, parentRef});
    // Change the doc's order to be a half step ahead of its target location
    collection.update(doc._id, {$set: {order}}, {selector: {type: 'any'}});

    // Reorder both ancestors' documents
    let oldAncestorId = doc.ancestors[0].id;
    reorderDocs({collection, ancestorId: oldAncestorId});

    let newAncestorId = getRootId(parent);
    if (newAncestorId !== oldAncestorId){
      reorderDocs({collection, ancestorId: newAncestorId});
    }
  },
});

const reorderDoc = new ValidatedMethod({
  name: 'organize.methods.reorderDoc',
  validate: new SimpleSchema({
    docRef: RefSchema,
    order: {
      type: Number,
      // Should end in 0.5 to place it reliably between two existing documents
    },
  }).validator(),
  run({docRef, order}) {
    let doc = fetchDocByRef(docRef);
    assertDocEditPermission(doc, this.userId);
    safeUpdateDocOrder({docRef, order})
  },
});

function getRootId(doc){
  if (doc.ancestors && doc.ancestors.length && doc.ancestors[0]){
    return doc.ancestors[0].id;
  } else {
    return doc._id;
  }
}

export { organizeDoc, reorderDoc };
