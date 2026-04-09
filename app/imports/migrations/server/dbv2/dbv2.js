import { Migrations } from 'meteor/percolate:migrations';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import { union, get } from 'lodash';
import Libraries from '/imports/api/library/Libraries';
import LibraryCollections from '/imports/api/library/LibraryCollections';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import computedSchemas from '/imports/api/properties/computedPropertySchemasIndex';
import applyFnToKey from '/imports/api/engine/computation/utility/applyFnToKey';

// Git version 2.0.52
// Database version 2
Migrations.add({
  version: 2,
  name: 'Separates creature property tags from library tags',

  async up() {
    console.log('migrating up library nodes 1 -> 2');
    await migrateCollection(LibraryNodes, migratePropUp);
    console.log('migrating up creature props 1 -> 2');
    await migrateCollection(CreatureProperties, migratePropUp);
    console.log('Migrating up libraries and collections to count subscribers');
    await countSubscribers();
  },

  async down() {
    console.log('Migrating down library nodes 2 -> 1');
    await migrateCollection(LibraryNodes, migratePropDown);
    console.log('Migrating down creature props 2 -> 1');
    await migrateCollection(CreatureProperties, migratePropDown);
  },

});

async function migrateCollection(collection, migrateDoc) {
  let index = 0;
  for await (const doc of collection.find({})) {
    if (index % 1000 === 0) {
      console.log(`Migrating document #${index}`);
    }
    await migrateDoc(doc, collection);
    index++;
  }
}

export async function migratePropUp(prop, collection) {
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
    // If the slot filler has a description, change it to a computed one
    if (typeof prop.description == 'string') {
      prop.description = { text: prop.description };
    }
  }

  // Don't look for slot fillers
  if (prop.slotType === 'slotFiller') {
    update = update || { $set: {} };
    update.$set.slotType = 'folder'
  }

  // If there are tags, copy them to libraryTags and set findable flags
  if (Array.isArray(prop.tags) && prop.tags.length && collection?._name === 'libraryNodes') {
    update = update || { $set: {} };
    update.$set.libraryTags = prop.tags;
    update.$set.fillSlots = true;
    update.$set.searchable = true;
  }

  // Replace dollar sign with tilde in calculated fields
  update = dollarSignToTilde(prop, update);

  // update the document
  if (update) {
    try {
      await collection.updateAsync({ _id: prop._id }, update, { bypassCollection2: true });
    } catch (e) {
      console.warn('Doc Migration failed: ', prop._id, e);
    }
  }
}

export async function migratePropDown(prop, collection) {
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
  if (update) {
    try {
      await collection.updateAsync({ _id: prop._id }, update, { bypassCollection2: true });
    } catch (e) {
      console.warn('Doc Migration failed: ', prop._id, e);
    }
  }
}

async function countSubscribers() {
  const bulkLib = Libraries.rawCollection().initializeUnorderedBulkOp();
  for await (const lib of Libraries.find({}, { fields: { _id: 1 } })) {
    const subscriberCount = await Meteor.users.find({ subscribedLibraries: lib._id }).countAsync();
    bulkLib.find({ _id: lib._id }).updateOne({
      $set: { subscriberCount }
    });
  }
  await bulkLib.execute();

  const bulkLibCols = LibraryCollections.rawCollection().initializeUnorderedBulkOp();
  for await (const col of LibraryCollections.find({}, { fields: { _id: 1 } })) {
    const subscriberCount = await Meteor.users.find({ subscribedLibraryCollections: col._id }).countAsync();
    bulkLibCols.find({ _id: col._id }).updateOne({
      $set: { subscriberCount }
    });
  }
  await bulkLibCols.execute();
}

const dollarSignRegex = /(\W|^)\$(\w+)/gi;
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
