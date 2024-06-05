import { check } from 'meteor/check';
import Libraries from '/imports/api/library/Libraries';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import getSlotFillFilter from '/imports/api/creature/creatureProperties/methods/getSlotFillFilter'
import getCreatureLibraryIds from '/imports/api/library/getCreatureLibraryIds';
import { LIBRARY_NODE_TREE_FIELDS } from '/imports/server/publications/library';
import escapeRegex from '/imports/api/utility/escapeRegex';
import getUserLibraryIds from '/imports/api/library/getUserLibraryIds';

// Publish docs the user has already selected so they don't disappear when searching
Meteor.publish('selectedCreatureTemplates', function (nodeIds) {
  let autorun = this.autorun;
  autorun(function () {
    // TODO 
    return [];
    let userId = this.userId;
    if (!userId) {
      return [];
    }

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

    let filter = { _id: { $in: nodeIds } };
    // Get the limit of the documents the user can fetch
    let options = {
      sort: {
        name: 1,
        order: 1,
      },
      limit: 100,
      fields: LIBRARY_NODE_TREE_FIELDS,
    };
    autorun(function () {
      return [
        LibraryNodes.find(filter, options),
        libraries
      ];
    });
  });
});

Meteor.publish('creatureTemplates', function (searchTerm) {
  if (searchTerm) check(searchTerm, String);

  let self = this;
  this.autorun(function () {
    let userId = this.userId;
    if (!userId) {
      return [];
    }

    // Get all the ids of libraries the user can access
    const userLibIds = getUserLibraryIds(userId);
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

    const libraryIds = libraries.map(lib => lib._id);

    this.autorun(function () {
      // Build a filter for nodes in those libraries
      const filter = {
        'root.id': { $in: libraryIds },
        type: 'creature',
        removed: { $ne: true },
      }

      // Get the limit of the documents the user can fetch
      var limit = self.data('limit') || 50;
      check(limit, Number);

      let options = undefined;
      if (searchTerm) {
        if (!filter.$and) filter.$and = [];
        filter.$and.push({
          $or: [
            { name: { $regex: escapeRegex(searchTerm), '$options': 'i' } },
            { libraryTags: searchTerm }
          ]
        });
        //filter.$text = { $search: searchTerm };
        options = {
          // relevant documents have a higher score.
          fields: {
            //_score: { $meta: 'textScore' },
            ...LIBRARY_NODE_TREE_FIELDS,
          },
          sort: {
            // `score` property specified in the projection fields above.
            //_score: { $meta: 'textScore' },
            name: 1,
            order: 1,
          }
        }
      } else {
        //delete filter.$text
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

      self.autorun(function () {
        self.setData('countAll', LibraryNodes.find(filter).count());
        self.setData('libraryNodeFilter', EJSON.stringify(filter));
      });
      self.autorun(function () {
        return [
          LibraryNodes.find(filter, options),
          libraries
        ];
      });
    });
  });
});
