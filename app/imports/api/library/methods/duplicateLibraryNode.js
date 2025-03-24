import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import { assertDocEditPermission } from '/imports/api/sharing/sharingPermissions';
import {
  setLineageOfDocs,
  renewDocIds,
  getFilter
} from '/imports/api/parenting/parentingFunctions';
import { rebuildNestedSets } from '/imports/api/parenting/parentingFunctions';

var snackbar;
if (Meteor.isClient) {
  snackbar = require(
    '/imports/client/ui/components/snackbars/SnackbarQueue'
  ).snackbar
}

const DUPLICATE_CHILDREN_LIMIT = 500;

const duplicateLibraryNode = new ValidatedMethod({
  name: 'libraryNodes.duplicate',
  validate: new SimpleSchema({
    _id: {
      type: String,
      max: 32,
    }
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 4,
    timeInterval: 6000,
  },
  run({ _id }) {
    let libraryNode = LibraryNodes.findOne(_id);
    if (!libraryNode) throw new Meteor.Error('not-found', 'Library node was not found');

    assertDocEditPermission(libraryNode, this.userId);

    let randomSrc = DDP.randomStream('duplicateLibraryNode');
    let libraryNodeId = randomSrc.id();
    libraryNode._id = libraryNodeId;

    let nodes = LibraryNodes.find({
      ...getFilter.descendants(libraryNode),
      removed: { $ne: true },
    }, {
      limit: DUPLICATE_CHILDREN_LIMIT + 1,
      sort: { left: 1 },
    }).fetch();

    if (nodes.length > DUPLICATE_CHILDREN_LIMIT) {
      nodes.pop();
      if (Meteor.isClient) {
        snackbar({
          text: `Only the first ${DUPLICATE_CHILDREN_LIMIT} children were duplicated`,
        });
      }
    }

    // Give the docs new IDs without breaking internal references
    const allNodes = [libraryNode, ...nodes];
    renewDocIds({ docArray: allNodes });

    // Order the root node
    libraryNode.order += 0.5;

    LibraryNodes.batchInsert(allNodes);

    // Tree structure changed by inserts, reorder the tree
    rebuildNestedSets(LibraryNodes, libraryNode.root.id);

    return libraryNodeId;
  },
});

export default duplicateLibraryNode;
