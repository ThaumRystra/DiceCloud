import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { RefSchema } from '/imports/api/parenting/ChildSchema';
import { assertDocEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import { changeParent, fetchDocByRefAsync, getCollectionByName, rebuildNestedSets } from '/imports/api/parenting/parentingFunctions';

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
  async run({ docRef, parentRef, order, skipRecompute, skipClient }) {
    if (skipClient && this.isSimulation) {
      return;
    }
    let doc = await fetchDocByRefAsync(docRef);
    let collection = getCollectionByName(docRef.collection);
    // The user must be able to edit both the doc and its parent to move it
    // successfully
    assertDocEditPermission(doc, this.userId);
    let parent;
    parent = await fetchDocByRefAsync(parentRef);
    assertDocEditPermission(parent, this.userId);

    // Moving the doc to the root level means changing its parent to undefined
    if (doc.root.id === parent._id) {
      parent = null;
    }
    // Change the doc's parent
    await changeParent(doc, parent, collection, order);

    // Figure out which creatures need to be recalculated after this move
    const docCreature = getCreatureAncestorId(doc);
    const parentCreature = getCreatureAncestorId(parent);
    // Mark the creatures for recompute
    if (!skipRecompute) {
      if (docCreature) {
        Creatures.updateAsync({
          _id: docCreature,
        }, {
          $set: { dirty: true },
        });
      }
      if (parentCreature && parentCreature !== docCreature) {
        Creatures.updateAsync({
          _id: parentCreature,
        }, {
          $set: { dirty: true },
        });
      }
    }
  },
});

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
  async run({ docRef, order }) {
    const doc = await fetchDocByRefAsync(docRef);
    assertDocEditPermission(doc, this.userId);

    let collection = getCollectionByName(docRef.collection);
    console.log('setting doc left to ', order);
    await collection.updateAsync(doc._id, { $set: { left: order } });

    // Recompute the affected creatures
    const creatureId = getCreatureAncestorId(doc);
    if (creatureId) {
      return Creatures.updateAsync({
        _id: creatureId
      }, {
        $set: { dirty: true },
      });
    }
  },
});

function getCreatureAncestorId(doc) {
  if (doc.type === 'pc' || doc.type === 'npc' || doc.type === 'monster') {
    return doc._id;
  }
  if (doc?.root?.collection === 'creatures') {
    return doc.root.id;
  }
}

export { organizeDoc, reorderDoc };
