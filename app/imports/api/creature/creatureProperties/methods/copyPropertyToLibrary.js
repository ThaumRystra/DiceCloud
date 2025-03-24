import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import { RefSchema } from '/imports/api/parenting/ChildSchema';
import {
  assertEditPermission,
  assertDocEditPermission,
  assertCopyPermission
} from '/imports/api/sharing/sharingPermissions';
import {
  fetchDocByRef,
  getFilter,
  renewDocIds
} from '/imports/api/parenting/parentingFunctions';
import { rebuildNestedSets } from '/imports/api/parenting/parentingFunctions';
import Libraries from '/imports/api/library/Libraries';
const DUPLICATE_CHILDREN_LIMIT = 500;

const copyPropertyToLibrary = new ValidatedMethod({
  name: 'creatureProperties.copyPropertyToLibrary',
  validate: new SimpleSchema({
    propId: {
      type: String,
      max: 32,
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
    const parentDoc = fetchDocByRef(parentRef);

    // Check permission to edit the destination
    let rootLibrary;
    if (parentRef.collection === 'libraries') {
      rootLibrary = parentDoc;
    } else if (parentRef.collection === 'libraryNodes') {
      rootLibrary = Libraries.findOne(parentDoc.root.id)
    } else {
      throw `${parentRef.collection} is not a valid parent collection`
    }
    assertEditPermission(rootLibrary, this.userId);

    const insertedRootNode = insertNodeFromProperty(propId, order, this);

    // Tree structure changed by inserts, reorder the tree
    rebuildNestedSets(LibraryNodes, rootLibrary._id);

    // Return the docId of the inserted root property
    return insertedRootNode?._id;
  },
});

function insertNodeFromProperty(propId, order, method) {
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

  let oldParentId = prop.parentId;
  const propCursor = CreatureProperties.find({
    ...getFilter.descendants(prop),
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

  // Give the docs new IDs without breaking internal references
  renewDocIds({
    docArray: props,
    collectionMap: { 'creatureProperties': 'libraryNodes' }
  });

  // Order the root node
  prop.left = Number.MAX_SAFE_INTEGER - 1;
  prop.right = Number.MAX_SAFE_INTEGER;

  // Clean the props
  props = cleanProps(props);

  // Insert the props as library nodes
  LibraryNodes.batchInsert(props);
  return prop;
}

/**
 * 
 * @param props The properties to check
 * @param userId The userId trying to copy these properties to a library
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
    fields: { root: 1 }
  }).forEach(node => {
    sourceLibIds.add(node.root.id);
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

export function cleanProps(props) {
  return props.map(prop => {
    let schema = LibraryNodes.simpleSchema(prop);
    return schema.clean(prop);
  });
}

export default copyPropertyToLibrary;
