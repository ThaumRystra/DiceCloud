import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import { assertDocEditPermission } from '/imports/api/sharing/sharingPermissions.js';
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

const DUPLICATE_CHILDREN_LIMIT = 500;

const duplicateLibraryNode = new ValidatedMethod({
  name: 'libraryNodes.duplicate',
  validate: new SimpleSchema({
    _id: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    }
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 4,
    timeInterval: 6000,
  },
  run({ _id }) {
    let libraryNode = LibraryNodes.findOne(_id);
    assertDocEditPermission(libraryNode, this.userId);

    let randomSrc = DDP.randomStream('duplicateLibraryNode');
    let libraryNodeId = randomSrc.id();
    libraryNode._id = libraryNodeId;

    let nodes = LibraryNodes.find({
      'ancestors.id': _id,
      removed: { $ne: true },
    }, {
      limit: DUPLICATE_CHILDREN_LIMIT + 1,
      sort: { order: 1 },
    }).fetch();

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
        ...libraryNode.ancestors,
        { id: libraryNodeId, collection: 'libraryNodes' }
      ],
      oldParent: { id: _id, collection: 'libraryNodes' },
    });

    // Give the docs new IDs without breaking internal references
    renewDocIds({ docArray: nodes });

    // Order the root node
    libraryNode.order += 0.5;

    LibraryNodes.batchInsert([libraryNode, ...nodes]);

    // Tree structure changed by inserts, reorder the tree
    reorderDocs({
      collection: LibraryNodes,
      ancestorId: libraryNode.ancestors[0].id,
    });

    return libraryNodeId;
  },
});

export default duplicateLibraryNode;
