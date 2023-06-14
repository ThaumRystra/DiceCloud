import { Migrations } from 'meteor/percolate:migrations';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import { union, get } from 'lodash';
import Libraries from '/imports/api/library/Libraries.js';
import LibraryCollections from '/imports/api/library/LibraryCollections.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import computedSchemas from '/imports/api/properties/computedPropertySchemasIndex.js';
import applyFnToKey from '/imports/api/engine/computation/utility/applyFnToKey.js';

// Git version 2.0.52
// Database version 2
Migrations.add({
  version: 2,
  name: 'Separates creature property tags from library tags',

  up() {
    console.log('migrating up library nodes 1 -> 2');
    migrateCollection(LibraryNodes, migratePropUp);
    console.log('migrating up creature props 1 -> 2');
    migrateCollection(CreatureProperties, migratePropUp);
    console.log('Migrating up libraries and collections to count subscribers');
    countSubscribers();
  },

  down() {
    console.log('Migrating down library nodes 2 -> 1');
    migrateCollection(LibraryNodes, migratePropDown);
    console.log('Migrating down creature props 2 -> 1');
    migrateCollection(CreatureProperties, migratePropDown);
  },

});

function migrateCollection(collection, migrateDoc) {
  const bulk = collection.rawCollection().initializeUnorderedBulkOp();
  collection.find({}).forEach(doc => migrateDoc(bulk, doc));
  bulk.execute();
}

export function migratePropUp(bulk, prop) {
  let update;
  if (prop.type === 'slotFiller') {
    update = update || { $set: {} };
    // Change the type to folder, slotFiller is deprecated
    update.$set.type = 'folder'
    // If the slot filler has an image set, move it
    if (typeof prop.picture === 'string') {
      update.$set.slotFillImage = prop.picture;
      update.$unset = { picture: 1 };
    }
  }
  // If there are tags, copy them to libraryTags and set findable flags
  if (Array.isArray(prop.tags) && prop.tags.length) {
    update = update || { $set: {} };
    update.$set.libraryTags = prop.tags;
    update.$set.fillSlots = true;
    update.$set.searchable = true;
  }
  update = dollarSignToTilde(prop, update);
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

const dollarSignRegex = /(\W)\$(\w+)/gi;
function dollarSignToTilde(prop, update) {
  computedSchemas[prop.type]?.inlineCalculationFields()?.forEach(calcKey => {
    applyFnToKey(prop, calcKey, (prop, key) => {
      const inlineCalcObj = get(prop, key);
      const string = inlineCalcObj?.text;
      if (!string) return;
      const newString = string.replace(dollarSignRegex, '$1~$2');
      if (string !== newString) {
        // If changed
        update = update || { $set: {} };
        if (!update.$unset) update.$unset = {};
        update.$unset[key + '.hash'] = 1; // zero the hash so it re-parses the calculation
        update.$set[key + '.text'] = newString
      }
    });
  });
  computedSchemas[prop.type]?.computedFields()?.forEach(calcKey => {
    applyFnToKey(prop, calcKey, (prop, key) => {
      const inlineCalcObj = get(prop, key);
      const string = inlineCalcObj?.calculation;
      if (!string) return;
      const newString = string.replace(dollarSignRegex, '$1~$2');
      if (string !== newString) {
        // If changed
        update = update || { $set: {} };
        if (!update.$unset) update.$unset = {};
        update.$unset[key + '.hash'] = 1; // remove the hash so it re-parses the calculation
        update.$set[key + '.calculation'] = newString
      }
    });
  });
  return update;
}
