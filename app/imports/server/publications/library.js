import SimpleSchema from 'simpl-schema';
import Libraries from '/imports/api/library/Libraries';
import LibraryCollections from '/imports/api/library/LibraryCollections';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import { assertViewPermission, assertDocViewPermission } from '/imports/api/sharing/sharingPermissions';
import { union } from 'lodash';
import { getFilter } from '/imports/api/parenting/parentingFunctions';

const LIBRARY_NODE_TREE_FIELDS = {
  _id: 1,
  name: 1,
  type: 1,
  icon: 1,
  color: 1,
  // Old tree fields
  order: 1,
  parent: 1,
  ancestors: 1,
  // Tree fields
  parentId: 1,
  left: 1,
  right: 1,
  root: 1,
  removed: 1,
  removedAt: 1,
  // Actions
  actionType: 1,
  // SlotFillers
  libraryTags: 1,
  slotQuantityFilled: 1,
  slotFillerType: 1,
  slotFillerConditionNote: 1,
  slotFillerCondition: 1,
  fillSlots: 1,
  searchable: 1,
  slotFillImage: 1,
  // Effect
  operation: 1,
  targetTags: 1,
  stats: 1,
  // Item
  quantity: 1,
  plural: 1,
  equipped: 1,
  // Branch
  branchType: 1,
  // Damage:
  damageType: 1,
  stat: 1,
  amount: 1,
  // Class level
  level: 1,
  variableName: 1,
  // Proficiency
  value: 1,
  // Reference
  cache: 1,
  // Saving throw
  dc: 1,
}

export { LIBRARY_NODE_TREE_FIELDS };

Meteor.publish('libraryCollection', function (libraryCollectionId) {
  let userId = this.userId;
  if (!userId) return [];
  const libraryCollectionCursor = LibraryCollections.find({
    _id: libraryCollectionId,
    $or: [
      { owner: userId },
      { writers: userId },
      { readers: userId },
      { public: true },
    ]
  });
  const libraryCollection = libraryCollectionCursor.fetch()[0];
  if (!libraryCollection) return [libraryCollectionCursor];
  const libraryCursor = Libraries.find({
    _id: { $in: libraryCollection.libraries },
    $or: [
      { owner: userId },
      { writers: userId },
      { readers: userId },
      { public: true },
    ]
  }, {
    sort: { name: 1 }
  });
  return [
    libraryCollectionCursor,
    libraryCursor,
    Meteor.users.find(
      libraryCollection.owner,
      { fields: { username: 1 } }
    ),
  ];
});

Meteor.publish('libraries', async function () {
  let userId = this.userId;
  if (!userId) {
    return [];
  }
  const user = await Meteor.users.findOneAsync(userId, {
    fields: { subscribedLibraries: 1, subscribedLibraryCollections: 1 }
  });

  // Get the collections the user is subscribed to
  const subCollections = user && user.subscribedLibraryCollections || [];
  const libraryCollectionsCursor = LibraryCollections.find({
    $or: [
      { owner: userId },
      { writers: userId },
      { readers: userId },
      { _id: { $in: subCollections }, public: true },
    ]
  }, {
    sort: { name: 1 }
  });

  // Collate all the libraryIds in those collections
  let collectionLibIds = [];
  libraryCollectionsCursor.forEach(libCollection => {
    collectionLibIds = union(collectionLibIds, libCollection.libraries);
  });

  // Get the libraries the user is subscribed to directly
  const subs = user && user.subscribedLibraries || [];

  // Combine all the library Ids
  const libIds = union(collectionLibIds, subs);

  const librariesCursor = Libraries.find({
    $or: [
      { owner: userId },
      { writers: userId },
      { readers: userId },
      { _id: { $in: libIds }, public: true },
    ]
  }, {
    sort: { name: 1 }
  });
  return [librariesCursor, libraryCollectionsCursor];
});

Meteor.publish('browseLibraries', function () {
  if (!this.userId) return [];
  return [
    Libraries.find({
      showInMarket: true,
      public: true,
    }, {
      sort: {
        subscriberCount: 1,
        name: 1,
      },
      limit: 500,
    }),
    LibraryCollections.find({
      showInMarket: true,
      public: true,
    }, {
      sort: {
        subscriberCount: 1,
        name: 1
      },
      limit: 500,
    }),
  ];
});

Meteor.publish('library', async function (libraryId) {
  if (!libraryId) return [];
  libraryIdSchema.validate({ libraryId });
  let userId = this.userId;
  let library = await Libraries.findOneAsync(libraryId);
  try { assertViewPermission(library, userId) }
  catch (e) {
    return this.error(e);
  }
  return [
    Libraries.find({
      _id: libraryId,
    }),
    Meteor.users.find(
      library.owner,
      { fields: { username: 1 } }
    ),
  ];
});

let libraryIdSchema = new SimpleSchema({
  libraryId: {
    type: String,
    max: 32,
  },
});

const extraFieldsSchema = new SimpleSchema({
  extraFields: {
    type: Array,
    optional: true,
  },
  'extraFields.$': {
    type: String,
  },
});

Meteor.publish('libraryNodes', async function (libraryId, extraFields) {
  if (!libraryId) return [];
  try {
    libraryIdSchema.validate({ libraryId });
    extraFieldsSchema.validate({ extraFields });
  } catch (e) {
    return this.error(e);
  }
  let userId = this.userId;
  let library = await Libraries.findOneAsync(libraryId);
  try {
    assertViewPermission(library, userId)
  } catch (e) {
    return this.error(e);
  }
  const fields = { ...LIBRARY_NODE_TREE_FIELDS };
  extraFields?.forEach(field => {
    fields[field] = 1;
  });
  return [
    LibraryNodes.find({
      'root.id': libraryId,
    }, {
      sort: { left: 1 },
      fields,
    }),
  ];
});

const nodeIdSchema = new SimpleSchema({
  libraryNodeId: {
    type: String,
    max: 32,
  },
});

Meteor.publish('libraryNode', function (libraryNodeId) {
  if (!libraryNodeId) return [];
  nodeIdSchema.validate({ libraryNodeId });
  const userId = this.userId;
  const nodeCursor = LibraryNodes.find({ _id: libraryNodeId });
  let node = nodeCursor.fetch()[0];
  try { assertDocViewPermission(node, userId) }
  catch (e) {
    return this.error(e);
  }
  return [nodeCursor];
});

Meteor.publish('softRemovedLibraryNodes', async function (libraryId) {
  if (!libraryId) return [];
  libraryIdSchema.validate({ libraryId });
  let userId = this.userId;
  let library = await Libraries.findOneAsync(libraryId);
  try { assertViewPermission(library, userId) }
  catch (e) {
    return this.error(e);
  }
  return [
    LibraryNodes.find({
      ...getFilter.descendantsOfRoot(libraryId),
      removed: true,
      removedWith: { $exists: false },
    }, {
      sort: { left: 1 },
    }),
  ];
});

Meteor.publish('descendantLibraryNodes', async function (nodeId) {
  let node = await LibraryNodes.findOneAsync(nodeId);
  let libraryId = node?.root.id;
  if (!libraryId || !node) return [];
  let userId = this.userId;
  try { assertDocViewPermission(node, userId) }
  catch (e) {
    return this.error(e);
  }
  return [
    LibraryNodes.find({
      ...getFilter.descendants(node),
    }, {
      sort: { left: 1 },
    }),
  ];
});
