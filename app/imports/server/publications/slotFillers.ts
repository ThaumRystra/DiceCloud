import { check } from 'meteor/check';
import Libraries from '/imports/api/library/Libraries';
import LibraryNodes, { type LibraryNode } from '/imports/api/library/LibraryNodes';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import getSlotFillFilter from '/imports/api/creature/creatureProperties/methods/getSlotFillFilter'
import getCreatureLibraryIds from '/imports/api/library/getCreatureLibraryIds';
import { LIBRARY_NODE_TREE_FIELDS } from '/imports/server/publications/library';
import escapeRegex from '/imports/api/utility/escapeRegex';

// Publish docs the user has already selected so they don't disappear when searching
Meteor.publish('selectedFillers', async function (slotId: string, nodeIds: string[], isDummySlot: string) {
  const userId = this.userId;
  if (!userId) {
    return [];
  }

  // Get the slot from the right collection
  let slot;
  if (isDummySlot) {
    slot = await LibraryNodes.findOneAsync(slotId);
  } else {
    slot = await CreatureProperties.findOneAsync(slotId);
  }

  if (!slot) return [];

  // Get all the ids of libraries the user can access
  const creatureId = slot.root.id;
  const libraryIds = await getCreatureLibraryIds(creatureId, userId);
  const libraries = Libraries.find({
    $or: [
      { owner: userId },
      { writers: userId },
      { readers: userId },
      { _id: { $in: libraryIds }, public: true },
    ]
  }, {
    sort: { name: 1 }
  });

  const filter: Mongo.Selector<LibraryNode> = { _id: { $in: nodeIds } };
  // Get the limit of the documents the user can fetch
  const options = {
    sort: {
      name: 1,
      order: 1,
    },
    limit: 100,
    fields: LIBRARY_NODE_TREE_FIELDS,
  };
  return [
    LibraryNodes.find(filter, options),
    libraries
  ];
});

Meteor.publish('slotFillers', async function (slotId: string, searchTerm: string, isDummySlot: boolean, limit: number) {
  if (searchTerm) check(searchTerm, String);
  limit = limit || 50;
  check(limit, Number);

  const userId = this.userId;
  if (!userId) {
    return [];
  }

  // Get the slot from the right collection
  let slot;
  if (isDummySlot) {
    slot = LibraryNodes.findOne(slotId);
  } else {
    slot = CreatureProperties.findOne(slotId);
  }


  if (!slot) return [];
  if (slot.type !== 'propertySlot' && slot.type !== 'class') {
    const error = new Meteor.Error('unexpected-type', `unexpected type in slot fillers subscription ${slot.type}`)
    console.warn(error);
    return this.error(error)
  }

  // Get all the ids of libraries the user can access
  const creatureId = slot.root.id;
  const libraryIds = await getCreatureLibraryIds(creatureId, userId);
  const libraries = Libraries.find({
    $or: [
      { owner: userId },
      { writers: userId },
      { readers: userId },
      { _id: { $in: libraryIds }, public: true },
    ]
  }, {
    sort: { name: 1 }
  });

  // Build a filter for nodes in those libraries that match the slot
  const filter = getSlotFillFilter({ slot, libraryIds }) as Mongo.Query<LibraryNode>;

  let options: Mongo.Options<LibraryNode> | undefined = undefined;
  if (searchTerm) {
    if (!filter.$and) filter.$and = [];
    filter.$and.push({
      $or: [
        { name: { $regex: escapeRegex(searchTerm), '$options': 'i' } },
        { libraryTags: searchTerm }
      ]
    });
    options = {
      fields: {
        ...LIBRARY_NODE_TREE_FIELDS,
      },
      sort: {
        'cache.node.name': 1,
        name: 1,
        order: 1,
      }
    }
  } else {
    //delete filter.$text
    delete filter.name
    options = {
      sort: {
        // References sorted in name order, but with non-references first, because undefined
        // is sorted before docs with cached name defined
        'cache.node.name': 1,
        name: 1,
        order: 1,
      },
      fields: LIBRARY_NODE_TREE_FIELDS,
    };
  }
  options.limit = limit;

  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const self = this;
  // @ts-expect-error doing crime
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  Mongo.Collection._publishCursor(libraries, self, 'libraries');

  const cursor = LibraryNodes.find(filter, options);
  const observeHandle = cursor.observeChanges({
    added: function (id, fields: Partial<LibraryNode> & { _slotFillerResult?: boolean }) {
      fields._slotFillerResult = true;
      self.added('libraryNodes', id, fields);
    },
    changed: function (id, fields) {
      self.changed('libraryNodes', id, fields);
    },
    removed: function (id) {
      self.removed('libraryNodes', id);
    }
  },
    { nonMutatingCallbacks: true }
  );

  self.onStop(function () {
    observeHandle.stop();
  });
  self.ready();
});

Meteor.publish('classFillers', async function (classId: string, searchTerm: string, limit: number) {
  if (!classId) return [];
  if (searchTerm) check(searchTerm, String);
  limit = limit || 50;
  check(limit, Number);

  const userId = this.userId;
  if (!userId) {
    return [];
  }
  // Get the class
  const classProp = CreatureProperties.findOne(classId);
  if (!classProp) {
    return [];
  }
  if (classProp.type !== 'class') {
    return [];
  }

  // Get all the ids of libraries the user can access
  const creatureId = classProp.root.id;
  const libraryIds = await getCreatureLibraryIds(creatureId, userId);
  const libraries = Libraries.find({
    $or: [
      { owner: userId },
      { writers: userId },
      { readers: userId },
      { _id: { $in: libraryIds }, public: true },
    ]
  }, {
    sort: { name: 1 }
  });

  // Build a filter for nodes in those libraries that match the slot
  const filter = getSlotFillFilter({ slot: classProp, libraryIds });

  const options = {
    sort: {
      level: 1,
      name: 1,
      order: 1,
    },
    fields: LIBRARY_NODE_TREE_FIELDS,
    limit,
  };

  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const self = this;
  // @ts-expect-error doing crime
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  Mongo.Collection._publishCursor(libraries, self, 'libraries');

  const cursor = LibraryNodes.find(filter, options);
  const observeHandle = cursor.observeChanges({
    added: function (id, fields: Partial<LibraryNode> & { _classFillerResult?: boolean }) {
      fields._classFillerResult = true;
      self.added('libraryNodes', id, fields);
    },
    changed: function (id, fields) {
      self.changed('libraryNodes', id, fields);
    },
    removed: function (id) {
      self.removed('libraryNodes', id);
    }
  },
    { nonMutatingCallbacks: true }
  );

  self.onStop(function () {
    observeHandle.stop();
  });
  self.ready();
});
