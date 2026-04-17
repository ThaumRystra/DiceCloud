import SimpleSchema from 'simpl-schema';
import { ValidatedMethod, type MethodContext } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties, { type CreatureProperty } from '/imports/api/creature/creatureProperties/CreatureProperties';
import LibraryNodes, { type LibraryNode } from '/imports/api/library/LibraryNodes';
import {
  assertEditPermission,
  assertDocEditPermission,
  assertCopyPermission,
  assertDocExists
} from '/imports/api/sharing/sharingPermissions';
import {
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
    libraryId: {
      type: String,
      max: 32,
    },
    parentId: {
      type: String,
      max: 32,
      optional: true,
    },
    left: {
      type: Number,
      optional: true,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 1,
    timeInterval: 5000,
  },
  async run({ propId, libraryId, parentId, left }: { propId: string, libraryId: string, parentId?: string, left: number }) {
    const property = await CreatureProperties.findOneAsync(propId);
    assertDocExists(property);
    await assertDocEditPermission(property, this.userId);

    const newLibrary = await Libraries.findOneAsync(libraryId);
    await assertEditPermission(newLibrary, this.userId);

    const insertedRootNode = await insertNodeFromProperty({ propId, libraryId, parentId, left, method: this });

    // Tree structure changed by inserts, reorder the tree
    await rebuildNestedSets(LibraryNodes, libraryId);

    // Return the docId of the inserted root property
    return insertedRootNode?._id;
  },
});

async function insertNodeFromProperty({ propId, libraryId, parentId, left, method }: {
  propId: string,
  libraryId: string,
  parentId: string | undefined,
  left: number,
  method: MethodContext,
}) {
  // Fetch the property and its descendants, provided they have not been removed
  const prop = await CreatureProperties.findOneAsync({
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

  const descCount = await CreatureProperties.find({
    ...getFilter.descendants(prop),
    removed: { $ne: true },
  }).countAsync();

  // Make sure there aren't too many descendants
  if (descCount > DUPLICATE_CHILDREN_LIMIT) {
    throw new Meteor.Error('Copy children limit',
      `The property has over ${DUPLICATE_CHILDREN_LIMIT} descendants and cannot be copied`);
  }

  let props = await CreatureProperties.find({
    ...getFilter.descendants(prop),
    removed: { $ne: true },
  }).fetchAsync();

  // The root prop is first in the array of props
  // It must get the first generated ID to prevent flickering
  props = [prop, ...props];

  // If the docs came from a library, that library must consent to this user copying their
  // properties
  await assertSourceLibraryCopyPermission(props, method);

  // Give the docs new IDs without breaking internal references
  renewDocIds({
    docArray: props,
    collectionMap: { 'creatureProperties': 'libraryNodes' },
    idMap: { [prop.root.id]: libraryId }
  });

  // Order the root node and assign it the correct parent
  prop.left = left;
  prop.right = left;
  prop.parentId = parentId;

  // Clean the props
  const cleanedProps = cleanProps(props);

  // Insert the props as library nodes
  for (const p of cleanedProps) {
    await LibraryNodes.insertAsync(p);
  }
  return prop;
}

/**
 * 
 * @param props The properties to check
 * @param userId The userId trying to copy these properties to a library
 * Checks that every property can be copied out of the library that originated it by this user
 */
async function assertSourceLibraryCopyPermission(props: CreatureProperty[], method: MethodContext) {
  // Skip on the client
  if (method.isSimulation) return;

  // Get all the library node ids that are sources for these properties
  const libraryNodeIds: string[] = [];
  props.forEach(prop => {
    if (prop.libraryNodeId) libraryNodeIds.push(prop.libraryNodeId);
  });
  if (!libraryNodeIds.length) return;

  // Get the actual library Ids that each of these source nodes came from
  const sourceLibIds = new Set<string>();
  await LibraryNodes.find({
    _id: { $in: libraryNodeIds }
  }, {
    fields: { root: 1 }
  }).forEachAsync(node => {
    sourceLibIds.add(node.root.id);
  });

  // Assert copy permission on each of those libraries
  const assertions = await Libraries.find({
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
  }).mapAsync(async (lib) => {
    return assertCopyPermission(lib, method.userId);
  });
  try {
    await Promise.all(assertions);
  } catch (e) {
    console.error(e);
    throw new Meteor.Error('Copy permission denied',
      'One of the properties you are copying comes from a library you do not have permission to copy from');
  }
}

export function cleanProps(props: CreatureProperty[]) {
  return props.map(prop => {
    const schema = LibraryNodes.simpleSchema(prop as unknown as LibraryNode);
    return schema.clean(prop) as LibraryNode;
  });
}

export default copyPropertyToLibrary;
