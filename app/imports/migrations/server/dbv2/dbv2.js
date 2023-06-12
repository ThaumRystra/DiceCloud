import { Migrations } from 'meteor/percolate:migrations';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import { union } from 'lodash';
import Libraries from '/imports/api/library/Libraries.js';
import LibraryCollections from '/imports/api/library/LibraryCollections.js';

// Git version 2.0.52
// Database version 2
Migrations.add({
  version: 2,
  name: 'Separates creature property tags from library tags',

  up() {
    console.log('migrating up library nodes 1 -> 2');
    const bulk = LibraryNodes.rawCollection().initializeUnorderedBulkOp();
    LibraryNodes.find({}).forEach(prop => migratePropUp(bulk, prop));
    bulk.execute();
    countSubscribers();
  },

  down() {
    console.log('Migrating down library nodes 2 -> 1');
    const bulk = LibraryNodes.rawCollection().initializeUnorderedBulkOp();
    LibraryNodes.find({}).forEach(prop => migratePropDown(bulk, prop));
    bulk.execute();
  },

});

export function migratePropUp(bulk, prop) {
  let update;
  // If the prop is a slot filler with an image, move it
  if (prop.type === 'slotFiller' && typeof prop.picture === 'string') {
    update = { $set: {} };
    update.$set.slotFillImage = prop.picture;
    update.$unset = { picture: 1 };
  }
  // If there are tags, copy them to libraryTags and set findable flags
  if (Array.isArray(prop.tags) && prop.tags.length) {
    update = update || { $set: {} };
    update.$set.libraryTags = prop.tags;
    update.$set.fillSlots = true;
    update.$set.searchable = true;
  }
  if (update) {
    bulk.find({ _id: prop._id }).updateOne(update);
  }
}

export function migratePropDown(bulk, prop) {
  const update = {
    $unset: {
      slotFillImage: 1,
      slotFillerCondition: 1,
      libraryTags: 1,
      fillSlots: 1,
      searchable: 1,
    }
  };
  if (prop.libraryTags?.length) {
    update.$set = {
      tags: union(prop.libraryTags, prop.tags)
    }
  }
  bulk.find({ _id: prop._id }).updateOne(update);
}

function countSubscribers() {
  console.log('Migrating up libraries and collections to count subscribers');
  const bulkLib = Libraries.rawCollection().initializeUnorderedBulkOp();
  Libraries.find({}, {
    fields: { _id: 1 }
  }).forEach(lib => {
    bulkLib.find({ _id: lib._id }).updateOne({
      $set: {
        subscriberCount: Meteor.users.find({ subscribedLibraries: lib._id }).count(),
      }
    });
  });
  bulkLib.execute();

  const bulkLibCols = Libraries.rawCollection().initializeUnorderedBulkOp();
  LibraryCollections.find({}, {
    fields: { _id: 1 }
  }).forEach(col => {
    bulkLibCols.find({ _id: col._id }).updateOne({
      $set: {
        subscriberCount: Meteor.users.find({ subscribedLibraryCollections: col._id }).count(),
      }
    });
  });
  bulkLibCols.execute();
}
