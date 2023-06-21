import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor.js';
import {
  setLineageOfDocs,
  renewDocIds
} from '/imports/api/parenting/parenting.js';
import { reorderDocs } from '/imports/api/parenting/order.js';
var snackbar;
if (Meteor.isClient) {
  snackbar = require(
    '/imports/client/ui/components/snackbars/SnackbarQueue.js'
  ).snackbar
}

const DUPLICATE_CHILDREN_LIMIT = 50;

const duplicateProperty = new ValidatedMethod({
  name: 'creatureProperties.duplicate',
  validate: new SimpleSchema({
    _id: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    }
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({ _id }) {
    let property = CreatureProperties.findOne(_id);
    let creature = getRootCreatureAncestor(property);

    assertEditPermission(creature, this.userId);

    // Renew the doc ID
    let randomSrc = DDP.randomStream('duplicateProperty');
    let propertyId = randomSrc.id();
    property._id = propertyId;

    // Change the variableName so it isn't immediately overridden
    if (property.variableName) {
      property.variableName += 'Copy'
    }

    // Get all the descendants
    let nodes = CreatureProperties.find({
      'ancestors.id': _id,
      removed: { $ne: true },
    }, {
      limit: DUPLICATE_CHILDREN_LIMIT + 1,
      sort: { order: 1 },
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

    // re-map all the ancestors
    setLineageOfDocs({
      docArray: nodes,
      newAncestry: [
        ...property.ancestors,
        { id: propertyId, collection: 'creatureProperties' }
      ],
      oldParent: { id: _id, collection: 'creatureProperties' },
    });

    // Give the docs new IDs without breaking internal references
    renewDocIds({ docArray: nodes });

    // Order the root node
    property.order += 0.5;

    // Mark the sheet as needing recompute
    property.dirty = true;

    // Insert the properties
    CreatureProperties.batchInsert([property, ...nodes]);

    // Tree structure changed by inserts, reorder the tree
    reorderDocs({
      collection: CreatureProperties,
      ancestorId: property.ancestors[0].id,
    });

    return propertyId;
  },
});

export default duplicateProperty;
