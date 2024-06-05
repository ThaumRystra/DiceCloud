import { Migrations } from 'meteor/percolate:migrations';
import Libraries from '/imports/api/library/Libraries';
import { rebuildNestedSets } from '/imports/api/parenting/parentingFunctions';
import Docs, { DOC_ROOT_ID } from '/imports/api/docs/Docs';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import { TreeDoc } from '/imports/api/parenting/ChildSchema';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables';

// Git version 2.0.59
// Database version 3
Migrations.add({
  version: 3,
  name: 'Changes parenting from array of ancestors to nested sets',
  up: Meteor.wrapAsync(async (_, next) => {
    console.log('migrating up library nodes 2 -> 3');
    migrateCollection('libraryNodes');
    console.log('migrating up creature props 2 -> 3');
    migrateCollection('creatureProperties');
    console.log('migrating up docs 2 -> 3');
    migrateCollection('docs');
    console.log('New parenting schema fields added, if it was done correctly remove the old fields manually');

    console.log('removing all CreatureVariables, creatures will add them back the next time they recalculate');
    CreatureVariables.remove({});

    console.log('Rebuilding nested sets for all libraries'); // Characters rebuild themselves on recompute
    const libraryIds = await Libraries.find().mapAsync((library) => library._id);
    for (const [index, libraryId] of libraryIds.entries()) {
      console.log('Rebuilding nested sets for library', index + 1, 'of', libraryIds.length);
      await rebuildNestedSets(LibraryNodes as Mongo.Collection<TreeDoc>, libraryId);
    }

    console.log('Removing all docs and replacing them with default docs');
    Docs.remove({});
    Assets.getText('docs/defaultDocs.json', (error, string) => {
      const docs = JSON.parse(string)
      docs.forEach(doc => Docs.insert(doc));
    });
    rebuildNestedSets(Docs, DOC_ROOT_ID);

    next();
  }),

  down() {
    throw 'Migrating from version 3 down to version 2 is not supported'
  },

});

export function migrateCollection(collectionName: string) {
  const collection = Mongo.Collection.get(collectionName);
  // Copy the parent id field and the root ancestor to the new structure
  // Using the mongo aggregation API
  // Waring: This will destroy parenting data if the old parenting fields are deleted
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
