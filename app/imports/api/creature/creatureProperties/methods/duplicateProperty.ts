import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import {
  getFilter,
  renewDocIds
} from '/imports/api/parenting/parentingFunctions';
import { rebuildNestedSets } from '/imports/api/parenting/parentingFunctions';

import { type snackbar as snackbarType } from '../../../../client/ui/components/snackbars/SnackbarQueue';
import { getDocByRefAsync } from '/imports/api/parenting/reference';
let snackbar: typeof snackbarType | undefined;
if (Meteor.isClient) {
  snackbar = (await import(
    '../../../../client/ui/components/snackbars/SnackbarQueue'
  )).snackbar
}

const DUPLICATE_CHILDREN_LIMIT = 50;

const duplicateProperty = new ValidatedMethod({
  name: 'creatureProperties.duplicate',
  validate: new SimpleSchema({
    _id: {
      type: String,
      max: 32,
    }
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ _id }: { _id: string }) {
    const property = await CreatureProperties.findOneAsync(_id);
    if (!property) throw new Meteor.Error('not-found', 'The source property was not found');

    const rootDoc = await getDocByRefAsync(property.root);

    await assertEditPermission(rootDoc, this.userId);

    // Renew the doc ID
    const randomSrc = DDP.randomStream('duplicateProperty');
    const propertyId = randomSrc.id();
    property._id = propertyId;

    // Change the variableName so it isn't immediately overridden
    if ('variableName' in property && property.variableName) {
      property.variableName += 'Copy'
    }

    // Get all the descendants
    const nodes = await CreatureProperties.find({
      ...getFilter.descendants(property),
      removed: { $ne: true },
    }, {
      limit: DUPLICATE_CHILDREN_LIMIT + 1,
      sort: { left: 1 },
    }).fetchAsync();

    // Alert the user if the limit was hit
    if (nodes.length > DUPLICATE_CHILDREN_LIMIT) {
      nodes.pop();
      if (snackbar) {
        snackbar({
          text: `Only the first ${DUPLICATE_CHILDREN_LIMIT} children were duplicated`,
        });
      }
    }

    // Give the docs new IDs without breaking internal references
    const allNodes = [property, ...nodes];
    renewDocIds({
      docArray: allNodes,
      idMap: {
        [_id]: propertyId,
        [propertyId]: propertyId,
      },
    });

    // Order the root node
    property.left = Number.MAX_SAFE_INTEGER - 1;
    property.right = Number.MAX_SAFE_INTEGER;

    // Mark the sheet as needing recompute
    property.dirty = true;

    // Insert the properties
    for (const node of allNodes) {
      await CreatureProperties.insertAsync(node);
    }

    // Tree structure changed by inserts, reorder the tree
    await rebuildNestedSets(CreatureProperties, property.root.id);

    return propertyId;
  },
});

export default duplicateProperty;
