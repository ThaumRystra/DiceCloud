import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import { RefSchema } from '/imports/api/parenting/ChildSchema.js';
import {
  assertEditPermission,
  assertDocEditPermission,
  assertCopyPermission
} from '/imports/api/sharing/sharingPermissions.js';
import {
  setLineageOfDocs,
  getAncestry,
  renewDocIds
} from '/imports/api/parenting/parenting.js';
import { reorderDocs } from '/imports/api/parenting/order.js';
import { setDocToLastOrder } from '/imports/api/parenting/order.js';
import Libraries from '/imports/api/library/Libraries.js';
const DUPLICATE_CHILDREN_LIMIT = 500;

const copyPropertyToLibrary = new ValidatedMethod({
  name: 'creatureProperties.copyPropertyToLibrary',
  validate: new SimpleSchema({
    propId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
    parentRef: {
      type: RefSchema,
    },
    order: {
      type: Number,
      optional: true,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 1,
    timeInterval: 5000,
  },
  run({ propId, parentRef, order }) {
    // get the new ancestry for the properties
    let { parentDoc, ancestors } = getAncestry({ parentRef });

    // Check permission to edit the destination
    let rootLibrary;
    if (parentRef.collection === 'libraries') {
      rootLibrary = parentDoc;
    } else if (parentRef.collection === 'libraryNodes') {
      rootLibrary = Libraries.findOne(parentDoc.ancestors[0].id)
    } else {
      throw `${parentRef.collection} is not a valid parent collection`
    }
    assertEditPermission(rootLibrary, this.userId);

    const insertedRootNode = insertNodeFromProperty(propId, ancestors, order, this);

    // Tree structure changed by inserts, reorder the tree
    reorderDocs({
      collection: LibraryNodes,
      ancestorId: rootLibrary._id,
    });

    // Return the docId of the inserted root property
    return insertedRootNode?._id;
  },
});

function insertNodeFromProperty(propId, ancestors, order, method) {
  // Fetch the property and its descendants, provided they have not been
  // removed
  let prop = CreatureProperties.findOne({
    _id: propId,
    removed: { $ne: true },
  });
  if (!prop) {
    if (Meteor.isClient) return;
    else {
      throw new Meteor.Error(
        'Insert property from library failed',
        `No property with id '${propId}' was found`
      );
    }
  }

  // Make sure we can edit this property
  assertDocEditPermission(prop, method.userId);

  let oldParent = prop.parent;
  const propCursor = CreatureProperties.find({
    'ancestors.id': propId,
    removed: { $ne: true },
  });

  // Make sure there aren't too many descendants
  if (propCursor.count() > DUPLICATE_CHILDREN_LIMIT) {
    throw new Meteor.Error('Copy children limit',
      `The property has over ${DUPLICATE_CHILDREN_LIMIT} descendants and cannot be copied`);
  }

  let props = propCursor.fetch();

  // The root prop is first in the array of props
  // It must get the first generated ID to prevent flickering
  props = [prop, ...props];

  // If the docs came from a library, that library must consent to this user copying their
  // properties
  assertSourceLibraryCopyPermission(props, method);

  // re-map all the ancestors
  setLineageOfDocs({
    docArray: props,
    newAncestry: ancestors,
    oldParent,
  });

  // Give the docs new IDs without breaking internal references
  renewDocIds({
    docArray: props,
    collectionMap: { 'creatureProperties': 'libraryNodes' }
  });

  // Order the root node
  if (order === undefined) {
    setDocToLastOrder({
      collection: LibraryNodes,
      doc: prop,
    });
  } else {
    prop.order = order;
  }

  // Clean the props
  props = cleanProps(props);

  // Insert the props as library nodes
  LibraryNodes.batchInsert(props);
  return prop;
}

/**
 * 
 * @param {[Property]} props The properties to check
 * @param {String} userId The userId trying to copy these properties to a library
 * Checks that every property can be copied out of the library that originated it by this user
 */
function assertSourceLibraryCopyPermission(props, method) {
  // Skip on the client
  if (method.isSimulation) return;

  // Get all the library node ids that are sources for these properties
  const libraryNodeIds = [];
  props.forEach(prop => {
    if (prop.libraryNodeId) libraryNodeIds.push(prop.libraryNodeId);
  });
  if (!libraryNodeIds.length) return;

  // Get the actual library Ids that each of these source nodes came from
  const sourceLibIds = new Set();
  LibraryNodes.find({
    _id: { $in: libraryNodeIds }
  }, {
    fields: { ancestors: 1 }
  }).forEach(node => {
    sourceLibIds.add(node.ancestors?.[0]?.id);
  });

  // Assert copy permission on each of those libraries
  Libraries.find({
    _id: { $in: Array.from(sourceLibIds) }
  }, {
    fields: {
      name: 1,
      owner: 1,
      readers: 1,
      writers: 1,
      public: 1,
      readersCanCopy: 1,
    }
  }).forEach(lib => {
    try {
      assertCopyPermission(lib, method.userId);
    } catch (e) {
      throw new Meteor.Error('Copy permission denied',
        `One of the properties you are copying comes from ${lib.name}, which you do not have permission to copy from`);
    }
  });
}

function cleanProps(props) {
  return props.map(prop => {
    let schema = LibraryNodes.simpleSchema(prop);
    return schema.clean(prop);
  });
}

export default copyPropertyToLibrary;
