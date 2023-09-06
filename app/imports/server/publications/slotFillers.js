import { check } from 'meteor/check';
import Libraries from '/imports/api/library/Libraries.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import getSlotFillFilter from '/imports/api/creature/creatureProperties/methods/getSlotFillFilter.js'
import getCreatureLibraryIds from '/imports/api/library/getCreatureLibraryIds.js';
import { LIBRARY_NODE_TREE_FIELDS } from '/imports/server/publications/library.js';
import escapeRegex from '/imports/api/utility/escapeRegex.js';

// Publish docs the user has already selected so they don't disappear when searching
Meteor.publish('selectedFillers', function (slotId, nodeIds, isDummySlot) {
  let autorun = this.autorun;
  autorun(function () {
    let userId = this.userId;
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
    const creatureId = slot.ancestors[0].id;
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

Meteor.publish('slotFillers', function (slotId, searchTerm, isDummySlot) {
  if (searchTerm) check(searchTerm, String);

  let self = this;
  this.autorun(function () {
    let userId = this.userId;
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
    const creatureId = slot.ancestors[0].id;
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

    this.autorun(function () {
      // Build a filter for nodes in those libraries that match the slot
      let filter = getSlotFillFilter({ slot, libraryIds });
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

Meteor.publish('classFillers', function (classId) {
  let self = this;
  if (!classId) return [];

  this.autorun(function () {
    let userId = this.userId;
    if (!userId) {
      return [];
    }
    // Get the class
    let classProp = CreatureProperties.findOne(classId);
    if (!classProp) {
      return [];
    }

    // Get all the ids of libraries the user can access
    const creatureId = classProp.ancestors[0].id;
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
    let filter = getSlotFillFilter({ slot: classProp, libraryIds });

    this.autorun(function () {
      // Get the limit of the documents the user can fetch
      var limit = self.data('limit') || 50;
      check(limit, Number);

      let options = {
        sort: {
          level: 1,
          name: 1,
          order: 1,
        },
        fields: LIBRARY_NODE_TREE_FIELDS,
        limit,
      };

      self.autorun(function () {
        self.setData('countAll', LibraryNodes.find(filter).count());
        self.setData('libraryNodeFilter', EJSON.stringify(filter));
      });
      self.autorun(function () {
        return [LibraryNodes.find(filter, options), libraries];
      });
    });
  });
});
