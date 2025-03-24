import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor';
import {
  getFilter,
  renewDocIds
} from '/imports/api/parenting/parentingFunctions';
import { rebuildNestedSets } from '/imports/api/parenting/parentingFunctions';
var snackbar;
if (Meteor.isClient) {
  snackbar = require(
    '/imports/client/ui/components/snackbars/SnackbarQueue'
  ).snackbar
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
  run({ _id }) {
    let property = CreatureProperties.findOne(_id);
    if (!property) throw new Meteor.Error('not-found', 'The source property was not found');

    const creature = getRootCreatureAncestor(property);

    assertEditPermission(creature, this.userId);

    // Renew the doc ID
    const randomSrc = DDP.randomStream('duplicateProperty');
    const propertyId = randomSrc.id();
    property._id = propertyId;

    // Change the variableName so it isn't immediately overridden
    if (property.variableName) {
      property.variableName += 'Copy'
    }

    // Get all the descendants
    const nodes = CreatureProperties.find({
      ...getFilter.descendants(property),
      removed: { $ne: true },
    }, {
      limit: DUPLICATE_CHILDREN_LIMIT + 1,
      sort: { left: 1 },
    }).fetch();

    // Alert the user if the limit was hit
    if (nodes.length > DUPLICATE_CHILDREN_LIMIT) {
      nodes.pop();
      if (Meteor.isClient) {
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
    CreatureProperties.batchInsert(allNodes);

    // Tree structure changed by inserts, reorder the tree
    rebuildNestedSets(CreatureProperties, property.root.id);

    return propertyId;
  },
});

export default duplicateProperty;
