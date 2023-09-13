import SimpleSchema from 'simpl-schema';
import { union } from 'lodash';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { changeParent, fetchDocByRef, getCollectionByName } from '/imports/api/parenting/parentingFunctions';
import { RefSchema } from '/imports/api/parenting/ChildSchema';
import { assertDocEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';

const organizeDoc = new ValidatedMethod({
  name: 'organize.organizeDoc',
  validate: new SimpleSchema({
    docRef: RefSchema,
    parentRef: RefSchema,
    order: {
      type: Number,
      // Should end in 0.5 to place it reliably between two existing documents
    },
    skipRecompute: {
      type: Boolean,
      optional: true,
    },
    skipClient: {
      type: Boolean,
      optional: true,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ docRef, parentId, order, skipRecompute, skipClient }) {
    if (skipClient && this.isSimulation) {
      return;
    }
    const collection = getCollectionByName(docRef.collection);
    const [doc, parent] = await Promise.all([
      collection.findOneAsync(docRef.id),
      collection.findOneAsync(parentId),
    ]);

    if (!doc) throw new Meteor.Error('Document not found', 'The property to move could not be found');
    if (!parent) throw new Meteor.Error('Document not found', 'The new parent could not be found');
    // The user must be able to edit both the doc and its parent to move it
    // successfully
    await Promise.all([
      assertDocEditPermission(doc, this.userId),
      // Only check parent if it has a different root
      doc.root.id !== parent.root.id && assertDocEditPermission(parent, this.userId),
    ]);

    // Change the doc's parent
    await changeParent(doc, parent, collection, order);

    // Figure out which creatures need to be recalculated after this move
    if (!skipRecompute && docRef.collection === 'creatures') {
      const creaturesToRecompute = union[doc.root.id, parent.root.id];
      // Mark the creatures for recompute
      await Creatures.updateAsync({
        _id: { $in: creaturesToRecompute }
      }, {
        $set: { dirty: true },
      }, {
        multi: true
      });
    }
  },
});

// TODO, rewrite
const reorderDoc = new ValidatedMethod({
  name: 'organize.reorderDoc',
  validate: new SimpleSchema({
    docRef: RefSchema,
    order: {
      type: Number,
      // Should end in 0.5 to place it reliably between two existing documents
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({ docRef, order }) {
    let doc = fetchDocByRef(docRef);
    assertDocEditPermission(doc, this.userId);
    safeUpdateDocOrder({ docRef, order });
    // Recompute the affected creatures
    const ancestors = getCreatureAncestors(doc);
    if (ancestors.length) {
      Creatures.update({
        _id: { $in: ancestors }
      }, {
        $set: { dirty: true },
      });
    }
  },
});

export { organizeDoc, reorderDoc };
