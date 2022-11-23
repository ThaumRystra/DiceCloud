import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { RefSchema } from '/imports/api/parenting/ChildSchema.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import {
  assertDocCopyPermission,
  assertDocEditPermission
} from '/imports/api/sharing/sharingPermissions.js';
import {
  setLineageOfDocs,
  renewDocIds
} from '/imports/api/parenting/parenting.js';
import { reorderDocs } from '/imports/api/parenting/order.js';
import fetchDocByRef from '/imports/api/parenting/fetchDocByRef.js';

var snackbar;
if (Meteor.isClient) {
  snackbar = require(
    '/imports/client/ui/components/snackbars/SnackbarQueue.js'
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
    const parentDoc = fetchDocByRef(parent);
    assertDocCopyPermission(libraryNode, this.userId);
    assertDocEditPermission(parentDoc, this.userId);

    let decendants = LibraryNodes.find({
      'ancestors.id': _id,
      removed: { $ne: true },
    }, {
      limit: DUPLICATE_CHILDREN_LIMIT + 1,
      sort: { order: 1 },
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

    const newAncestry = parentDoc.ancestors || [];
    newAncestry.push(parent);
    // re-map all the ancestors
    setLineageOfDocs({
      docArray: nodes,
      newAncestry,
      oldParent: libraryNode.parent,
    });

    // Give the docs new IDs without breaking internal references
    renewDocIds({ docArray: nodes });

    // Order the root node
    libraryNode.order = (parentDoc.order || 0) + 0.5;

    LibraryNodes.batchInsert(nodes);

    // Tree structure changed by inserts, reorder the tree
    reorderDocs({
      collection: LibraryNodes,
      ancestorId: parent.collection === 'libraries' ? parent.id : parentDoc.ancestors[0].id,
    });
  },
});

export default copyLibraryNodeTo;
