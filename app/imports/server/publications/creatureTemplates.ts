import { check } from 'meteor/check';
import Libraries from '/imports/api/library/Libraries';
import LibraryNodes, { type LibraryNode } from '/imports/api/library/LibraryNodes';
import { LIBRARY_NODE_TREE_FIELDS } from '/imports/server/publications/library';
import escapeRegex from '/imports/api/utility/escapeRegex';
import getUserLibraryIds from '/imports/api/library/getUserLibraryIds';

// Publish docs the user has already selected so they don't disappear when searching
Meteor.publish('selectedCreatureTemplates', async function (nodeIds) {
  // TODO
  return [];
});

Meteor.publish('creatureTemplates', async function (searchTerm, limit) {
  if (searchTerm) check(searchTerm, String);
  limit = limit || 50;
  check(limit, Number);

  let userId = this.userId;
  if (!userId) {
    return [];
  }

  // Get all the ids of libraries the user can access
  const userLibIds = await getUserLibraryIds(userId);
  const libraries = Libraries.find({
    $or: [
      { owner: userId },
      { writers: userId },
      { readers: userId },
      { _id: { $in: userLibIds }, public: true },
    ]
  }, {
    sort: { name: 1 }
  });

  const libraryIds = await libraries.mapAsync(lib => lib._id);

  // Build a filter for nodes in those libraries
  const filter: Mongo.Selector<LibraryNode> = {
    'root.id': { $in: libraryIds },
    type: 'creature',
    removed: { $ne: true },
  }

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
        name: 1,
        order: 1,
      }
    }
  } else {
    delete filter.name
    options = {
      sort: {
        name: 1,
        order: 1,
      },
      fields: LIBRARY_NODE_TREE_FIELDS,
    };
  }
  options.limit = limit;

  let self = this;
  //@ts-expect-error Doing crime
  Mongo.Collection._publishCursor(libraries, self, 'libraries');

  let cursor = LibraryNodes.find(filter, options);
  let observeHandle = cursor.observeChanges({
    added: function (id, fields: Partial<LibraryNode> & { _creatureTemplateResult?: true }) {
      fields._creatureTemplateResult = true;
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
