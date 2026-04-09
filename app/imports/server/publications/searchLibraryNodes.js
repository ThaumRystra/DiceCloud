import { check } from 'meteor/check';
import Libraries from '/imports/api/library/Libraries';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import getCreatureLibraryIds from '/imports/api/library/getCreatureLibraryIds';
import getUserLibraryIds from '/imports/api/library/getUserLibraryIds';
import { assertViewPermission } from '/imports/api/sharing/sharingPermissions';
import escapeRegex from '/imports/api/utility/escapeRegex';
import { getFilter } from '/imports/api/parenting/parentingFunctions';

Meteor.publish('selectedLibraryNodes', function (selectedNodeIds) {
  check(selectedNodeIds, Array);
  // Limit to 20 selected nodes
  if (selectedNodeIds.length > 20) {
    selectedNodeIds = selectedNodeIds.slice(0, 20);
  }
  let libraryViewPermissions = {};
  const nodes = [];
  // Check view permissions of all libraries
  for (let id of selectedNodeIds) {
    let node = LibraryNodes.findOne(id);
    if (!node) continue;
    nodes.push(node);
    let libraryId = node.ancestors[0].id;
    if (libraryViewPermissions[id]) {
      continue;
    } else {
      let library = Libraries.findOne(libraryId, {
        fields: {
          owner: 1,
          readers: 1,
          writers: 1,
          public: 1,
          root: 1,
          left: 1,
          right: 1,
        }
      });
      assertViewPermission(library, this.userId);
      libraryViewPermissions[id] = true;
    }
  }
  // Return all nodes and their children
  return [LibraryNodes.find({
    $or: [
      { _id: { $in: selectedNodeIds } },
      { ...getFilter.descendantsOfAll(nodes) },
    ],
  })];
});

Meteor.publish('searchLibraryNodes', function (creatureId, type, searchTerm, limit) {
  if (!type) return [];

  let userId = this.userId;
  if (!userId) {
    return [];
  }

  limit = limit || 32;
  if (searchTerm) check(searchTerm, String);
  check(limit, Number);

  // Get all the ids of libraries the user can access
  let libraryIds;
  if (creatureId) {
    libraryIds = getCreatureLibraryIds(creatureId, userId)
  } else {
    libraryIds = getUserLibraryIds(userId)
  }

  // Build a filter for nodes in those libraries that match the type
  let filter = {
    ...getFilter.descendantsOfAllRoots(libraryIds),
    removed: { $ne: true },
    searchable: true //library nodes must opt-in
  };
  if (type) {
    filter.$or = [{
      type,
    }, {
      slotFillerType: type,
    }];
  }

  let options = undefined;
  if (searchTerm) {
    // Regex search instead of text index
    filter.$and = [{
      $or: [
        { name: { $regex: escapeRegex(searchTerm), '$options': 'i' } },
        { libraryTags: searchTerm },
      ],
    }];
    options = {
      sort: {
        'root.id': 1,
        name: 1,
        left: 1,
      }
    }
  } else {
    delete filter.$and;
    options = {
      sort: {
        'root.id': 1,
        name: 1,
        left: 1,
      }
    };
  }
  options.limit = limit;

  let self = this;
  let cursor = LibraryNodes.find(filter, options);
  const libraries = Libraries.find({ _id: { $in: libraryIds } });

  Mongo.Collection._publishCursor(libraries, self, 'libraries');

  let observeHandle = cursor.observeChanges({
    added: function (id, fields) {
      fields._searchResult = true;
      self.added('libraryNodes', id, fields);
    },
    changed: function (id, fields) {
      self.changed('libraryNodes', id, fields);
    },
    removed: function (id) {
      self.removed('libraryNodes', id);
    }
  },
    // Publications don't mutate the documents
    { nonMutatingCallbacks: true }
  );

  // register stop callback (expects lambda w/ no args).
  self.onStop(function () {
    observeHandle.stop();
  });
  self.ready();
});
