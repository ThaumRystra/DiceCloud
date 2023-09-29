import { Migrations } from 'meteor/percolate:migrations';

// Git version 2.0.59
// Database version 3
Migrations.add({
  version: 3,
  name: 'Separates creature property tags from library tags',

  up() {
    console.log('migrating up library nodes 2 -> 3');
    migrateCollection('libraryNodes');
    console.log('migrating up creature props 2 -> 3');
    migrateCollection('creatureProperties');
    console.log('New schema fields added, if it was done correctly remove the old fields manually');
  },

  down() {
    throw 'Migrating from version 3 down to version 2 is not supported'
  },

});

export function migrateCollection(collectionName: string) {
  // @ts-expect-error Collection.get is not defined
  const collection = Mongo.Collection.get(collectionName);
  // Copy the parent id field and the root ancestor to the new structure
  // Using the mongo aggregation API
  return collection.rawCollection().updateMany({}, [
    {
      $addFields: {
        'root': { $arrayElemAt: ['$ancestors', 0] },
        'parentId': {
          // Parent ID must refer to a document in the same collection, so remove the parent ID
          // if the parent reference refers to a different collection
          $cond: {
            if: { $eq: [collectionName, '$parent.collection'] },
            then: '$parent.id',
            else: '$$REMOVE',
          }
        },
        // Set left and right to current order so that order is maintained on the first re-build
        // of the tree structure
        'left': '$order',
        'right': '$order',
      }
    },
  ]);
}
