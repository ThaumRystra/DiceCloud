import { check } from 'meteor/check';
import Libraries from '/imports/api/library/Libraries';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import getSlotFillFilter from '/imports/api/creature/creatureProperties/methods/getSlotFillFilter'
import getCreatureLibraryIds from '/imports/api/library/getCreatureLibraryIds';
import { LIBRARY_NODE_TREE_FIELDS } from '/imports/server/publications/library';
import escapeRegex from '/imports/api/utility/escapeRegex';

// Publish docs the user has already selected so they don't disappear when searching
Meteor.publish('selectedFillers', function (slotId, nodeIds, isDummySlot) {
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

  // Get all the ids of libraries the user can access
  const creatureId = slot.root.id;
  const libraryIds = getCreatureLibraryIds(creatureId, userId);
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

  const filter = { _id: { $in: nodeIds } };
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

Meteor.publish('slotFillers', function (slotId, searchTerm, isDummySlot, limit) {
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

  // Get all the ids of libraries the user can access
  const creatureId = slot.root.id;
  const libraryIds = getCreatureLibraryIds(creatureId, userId);
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
  const filter = getSlotFillFilter({ slot, libraryIds });

  let options = undefined;
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

  const self = this;
  Mongo.Collection._publishCursor(libraries, self, 'libraries');

  const cursor = LibraryNodes.find(filter, options);
  const observeHandle = cursor.observeChanges({
    added: function (id, fields) {
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

Meteor.publish('classFillers', function (classId, searchTerm, limit) {
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

  // Get all the ids of libraries the user can access
  const creatureId = classProp.root.id;
  const libraryIds = getCreatureLibraryIds(creatureId, userId);
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

  const self = this;
  Mongo.Collection._publishCursor(libraries, self, 'libraries');

  const cursor = LibraryNodes.find(filter, options);
  const observeHandle = cursor.observeChanges({
    added: function (id, fields) {
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
