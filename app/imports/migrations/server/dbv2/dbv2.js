import { Migrations } from 'meteor/percolate:migrations';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import { union } from 'lodash';

// Git version 2.0-beta.33
// Database version 1
Migrations.add({
  version: 2,
  name: 'Separates creature property tags from library tags',

  up() {
    console.log('migrating up library nodes 1 -> 2');
    const bulk = LibraryNodes.rawCollection().initializeUnorderedBulkOp();
    LibraryNodes.find({}).forEach(prop => migratePropUp(bulk, prop));
    bulk.execute();
  },

  down() {
    console.log('migrating down library nodes 2 -> 1');
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
