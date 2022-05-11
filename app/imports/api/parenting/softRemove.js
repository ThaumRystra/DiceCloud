import getCollectionByName from '/imports/api/parenting/getCollectionByName.js';
import { updateDescendants } from '/imports/api/parenting/parenting.js';

export function softRemove({_id, collection}){
  let removalDate = new Date();
  if (typeof collection === 'string') {
    collection = getCollectionByName(collection);
  }
  // Remove this document
  collection.update(
    _id, {
      $set: {
        removed: true,
        removedAt: removalDate,
      },
      $unset: {
        removedWith: 1,
      }
    }, {
      selector: {type: 'any'},
    },
  );
  // Remove all the descendants that have not yet been removed, and set them to be
  // removed with this document
  updateDescendants({
    collection,
    ancestorId: _id,
    filter: {removed: {$ne: true}},
    modifier: {$set: {
      removed: true,
      removedAt: removalDate,
      removedWith: _id,
    }},
  });
}

const restoreError = function(){
  throw new Meteor.Error('restore-failed',
    'Could not restore this document, maybe it was removed by a parent?'
  );
};

export function restore({ _id, collection, extraUpdates}){
  if (typeof collection === 'string') {
    collection = getCollectionByName(collection);
  }
  const update = {
    $unset: {
      removed: 1,
      removedAt: 1,
    },
    ...extraUpdates
  }

  let numUpdated = collection.update({
    _id,
    removedWith: {$exists: false}
  }, update , {
    selector: {type: 'any'},
  },);
  if (numUpdated === 0) restoreError();
  updateDescendants({
    collection,
    ancestorId: _id,
    filter: {
      removedWith: _id,
    },
    modifier: { $unset: {
      removed: 1,
      removedAt: 1,
      removedWith: 1,
    }},
  });
}
