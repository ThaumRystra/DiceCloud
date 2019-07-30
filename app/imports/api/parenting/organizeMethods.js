import SimpleSchema from 'simpl-schema';
import { updateParent } from '/imports/api/parenting/parenting.js';
import { updateOrder } from '/imports/api/parenting/order.js';
import { RefSchema } from '/imports/api/parenting/ChildSchema.js';
import { assertDocEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import fetchDocByRef from '/imports/api/parenting/fetchDocByRef.js';

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

    // The user must be able to edit both the doc and its parent to move it
    // successfully
    assertDocEditPermission(doc, this.userId);
    let parent = fetchDocByRef(parentRef);
    assertDocEditPermission(parent, this.userId);
    updateParent({docRef, parentRef});
    updateOrder({docRef, order})
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
    updateOrder({docRef, order})
  },
});

export { organizeDoc, reorderDoc };
