import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { RefSchema } from '/imports/api/parenting/ChildSchema';
import { assertDocEditPermission, assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import { compact } from 'lodash';
import Creatures from '/imports/api/creature/creatures/Creatures';
import { fetchDocByRefAsync, getCollectionByName, moveDocBetweenRoots, moveDocWithinRoot } from '/imports/api/parenting/parentingFunctions';

const moveBetweenRoots = new ValidatedMethod({
  name: 'organize.moveDocBetweenRoots',
  validate: new SimpleSchema({
    docRef: RefSchema,
    newPosition: {
      type: Number, // Must end in .5
    },
    newRootRef: RefSchema,
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
  async run({ docRef, newPosition, newRootRef, skipRecompute, skipClient }) {
    if (skipClient && this.isSimulation) {
      return;
    }
    let doc = await fetchDocByRefAsync(docRef);
    let collection = getCollectionByName(docRef.collection);
    // The user must be able to edit both the doc and its parent to move it
    // successfully
    assertDocEditPermission(doc, this.userId);
    const newRoot = await fetchDocByRefAsync(newRootRef);
    assertEditPermission(newRoot, this.userId);


    // Move the doc
    await moveDocBetweenRoots(doc, collection, newRootRef, newPosition);

    // Figure out which creatures need to be recalculated after this move
    const creatureIdsToRecalculate = compact([
      getCreatureAncestorId(doc),
      getCreatureAncestorId(newRoot),
    ]);

    // Mark the creatures for recompute
    if (!skipRecompute && creatureIdsToRecalculate.length) {
      Creatures.updateAsync({
        _id: { $in: creatureIdsToRecalculate },
      }, {
        $set: { dirty: true },
      });
    }
  },
});

const moveWithinRoot = new ValidatedMethod({
  name: 'organize.moveDocWithinRoot',
  validate: new SimpleSchema({
    docRef: RefSchema,
    newPosition: {
      type: Number, // Must end in .5
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
  async run({ docRef, newPosition, skipRecompute, skipClient }) {
    if (skipClient && this.isSimulation) {
      return;
    }
    let doc = await fetchDocByRefAsync(docRef);
    let collection = getCollectionByName(docRef.collection);

    // The user must be able to edit the doc
    assertDocEditPermission(doc, this.userId);

    // Move the doc
    await moveDocWithinRoot(doc, collection, newPosition);

    // Figure out which creature needs to be recalculated after this move
    const creatureIdToRecalculate = getCreatureAncestorId(doc);

    // Mark the creatures for recompute
    if (!skipRecompute && creatureIdToRecalculate) {
      Creatures.updateAsync({
        _id: creatureIdToRecalculate,
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

export { moveBetweenRoots, moveWithinRoot };
