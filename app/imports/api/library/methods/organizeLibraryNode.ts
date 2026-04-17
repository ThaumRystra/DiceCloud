import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertDocEditPermission, assertDocExists, assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import { moveDocBetweenRoots, moveDocWithinRoot } from '/imports/api/parenting/parentingFunctions';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { getDocByRefAsync } from '/imports/api/parenting/reference';
import LibraryNodes, { libraryNodeRootCollections } from '/imports/api/library/LibraryNodes';

const moveBetweenRoots = new ValidatedMethod({
  name: 'libraryNodes.organize.moveDocBetweenRoots',
  validate: TypedSimpleSchema.from({
    nodeId: {
      type: String,
      max: 32,
    },
    newParentId: {
      type: String,
      max: 32,
    },
    left: {
      type: Number, // Must end in .5
    },
    newRoot: {
      type: Object,
    },
    'newRoot.id': {
      type: String,
      max: 32,
    },
    'newRoot.collection': {
      type: String,
      max: STORAGE_LIMITS.collectionName,
      allowedValues: libraryNodeRootCollections,
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
  async run({ nodeId, left: newPosition, newRoot, skipClient }) {
    if (skipClient && this.isSimulation) {
      return;
    }
    const node = await LibraryNodes.findOneAsync(nodeId);
    assertDocExists(node);
    await assertDocEditPermission(node, this.userId);
    const newRootDoc = await getDocByRefAsync(newRoot);
    assertDocExists(newRootDoc);
    await assertEditPermission(newRootDoc, this.userId);

    // Move the doc
    await moveDocBetweenRoots(node, LibraryNodes, newRoot, newPosition);
  },
});

const moveWithinRoot = new ValidatedMethod({
  name: 'libraryNodes.organize.moveDocWithinRoot',
  validate: TypedSimpleSchema.from({
    nodeId: {
      type: String,
      max: 32,
    },
    newPosition: {
      type: Number, // Must end in .5
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
  async run({ nodeId, newPosition, skipClient }) {
    if (skipClient && this.isSimulation) {
      return;
    }
    const node = await LibraryNodes.findOneAsync(nodeId);
    assertDocExists(node);
    await assertDocEditPermission(node, this.userId);

    // Move the doc
    await moveDocWithinRoot(node, LibraryNodes, newPosition);
  },
});

export { moveBetweenRoots, moveWithinRoot };
