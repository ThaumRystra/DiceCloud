import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { RefSchema } from '/imports/api/parenting/ChildSchema';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import {
  assertDocCopyPermission,
  assertDocEditPermission
} from '/imports/api/sharing/sharingPermissions';
import {
  setLineageOfDocs,
  renewDocIds,
  getFilter
} from '/imports/api/parenting/parentingFunctions';
import { rebuildNestedSets } from '/imports/api/parenting/parentingFunctions';
import { fetchDocByRef } from '/imports/api/parenting/parentingFunctions';

var snackbar;
if (Meteor.isClient) {
  snackbar = require(
    '/imports/client/ui/components/snackbars/SnackbarQueue'
  ).snackbar
}

const DUPLICATE_CHILDREN_LIMIT = 500;

const copyLibraryNodeTo = new ValidatedMethod({
  name: 'libraryNodes.copyTo',
  validate: new SimpleSchema({
    _id: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
    parent: {
      type: RefSchema,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 1,
    timeInterval: 10000,
  },
  run({ _id, parent }) {
    if (parent.collection !== 'libraryNodes' && parent.collection !== 'libraries') {
      throw new Meteor.Error('Invalid destination',
        'Library documents can only be copied to destinations inside other libraries'
      );
    }
    const libraryNode = LibraryNodes.findOne(_id);
    if (!libraryNode) throw new Meteor.Error('not-found', 'Library node was not found');

    const parentDoc = fetchDocByRef(parent);
    assertDocCopyPermission(libraryNode, this.userId);
    assertDocEditPermission(parentDoc, this.userId);

    let decendants = LibraryNodes.find({
      ...getFilter.descendants(libraryNode),
      removed: { $ne: true },
    }, {
      limit: DUPLICATE_CHILDREN_LIMIT + 1,
      sort: { left: 1 },
    }).fetch();

    if (decendants.length > DUPLICATE_CHILDREN_LIMIT) {
      decendants.pop();
      if (Meteor.isClient) {
        snackbar({
          text: `Only the first ${DUPLICATE_CHILDREN_LIMIT} children were duplicated`,
        });
      }
    }

    const nodes = [libraryNode, ...decendants];

    // Give the docs new IDs without breaking internal references
    renewDocIds({ docArray: nodes });

    // Order the root node
    libraryNode.left = Number.MAX_SAFE_INTEGER - 1;
    libraryNode.right = Number.MAX_SAFE_INTEGER;

    LibraryNodes.batchInsert(nodes);

    // Tree structure changed by inserts, reorder the tree
    rebuildNestedSets(LibraryNodes, parentDoc.root.id);
  },
});

export default copyLibraryNodeTo;
