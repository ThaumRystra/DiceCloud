import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertDocEditPermission, assertDocExists, assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import { compact } from 'lodash';
import Creatures from '/imports/api/creature/creatures/Creatures';
import { moveDocBetweenRoots, moveDocWithinRoot } from '/imports/api/parenting/parentingFunctions';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { getDocByRefAsync } from '/imports/api/parenting/reference';
import CreatureProperties, { creaturePropertyRootCollections } from '/imports/api/creature/creatureProperties/CreatureProperties';

const moveBetweenRoots = new ValidatedMethod({
  name: 'creatureProperties.organize.moveDocBetweenRoots',
  validate: TypedSimpleSchema.from({
    propId: {
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
      allowedValues: creaturePropertyRootCollections,
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
  async run({ propId, left: newPosition, newRoot, skipRecompute, skipClient }) {
    if (skipClient && this.isSimulation) {
      return;
    }
    const prop = await CreatureProperties.findOneAsync(propId);
    assertDocExists(prop);
    await assertDocEditPermission(prop, this.userId);
    const newRootDoc = await getDocByRefAsync(newRoot);
    assertDocExists(newRootDoc);
    await assertEditPermission(newRootDoc, this.userId);

    // Move the doc
    await moveDocBetweenRoots(prop, CreatureProperties, newRoot, newPosition);

    // Figure out which creatures need to be recalculated after this move
    const creatureIdsToRecalculate = compact([
      ...newRoot.collection === 'creatures' ? [newRoot.id] : [],
      ...prop.root.collection === 'creatures' ? [prop.root.id] : [],
    ]);

    // Mark the creatures for recompute
    if (!skipRecompute && creatureIdsToRecalculate.length) {
      await Creatures.updateAsync({
        _id: { $in: creatureIdsToRecalculate },
      }, {
        $set: { dirty: true },
      });
    }
  },
});

const moveWithinRoot = new ValidatedMethod({
  name: 'creatureProperties.organize.moveDocWithinRoot',
  validate: TypedSimpleSchema.from({
    propId: {
      type: String,
      max: 32,
    },
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
  async run({ propId, newPosition, skipRecompute, skipClient }) {
    if (skipClient && this.isSimulation) {
      return;
    }
    const prop = await CreatureProperties.findOneAsync(propId);
    assertDocExists(prop);
    await assertDocEditPermission(prop, this.userId);

    // Move the doc
    await moveDocWithinRoot(prop, CreatureProperties, newPosition);

    // Mark the creatures for recompute
    if (!skipRecompute && prop.root.collection === 'creatures') {
      await Creatures.updateAsync({
        _id: prop.root.id,
      }, {
        $set: { dirty: true },
      });
    }
  },
});

export { moveBetweenRoots, moveWithinRoot };
