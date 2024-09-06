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
