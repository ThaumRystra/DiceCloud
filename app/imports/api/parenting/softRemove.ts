import { getCollectionByName, getFilter } from '/imports/api/parenting/parentingFunctions';
import { TreeDoc } from '/imports/api/parenting/ChildSchema';

export function softRemove(collectionOrName: Mongo.Collection<TreeDoc> | string, docOrId?: TreeDoc | string) {
  const removalDate = new Date();

  let collection: Mongo.Collection<TreeDoc>;
  if (typeof collectionOrName === 'string') {
    collection = getCollectionByName(collectionOrName);
  } else {
    collection = collectionOrName;
  }

  let doc: TreeDoc | undefined;
  if (typeof docOrId === 'string') {
    doc = collection.findOne(docOrId);
  } else {
    doc = docOrId
  }
  if (!doc) {
    throw new Meteor.Error('not found', 'The document to remove was not found');
  }

  // Remove this document
  collection.update(
    doc._id,
    {
      $set: {
        removed: true,
        removedAt: removalDate,
      },
      $unset: {
        removedWith: 1,
      }
    }
  );
  // Remove all the descendants that have not yet been removed, and set them to be
  // removed with this document
  collection.update({
    ...getFilter.descendants(doc),
    removed: { $ne: true },
  }, {
    $set: {
      removed: true,
      removedAt: removalDate,
      removedWith: doc._id,
    }
  }, {
    multi: true,
  });
}

const restoreError = function () {
  throw new Meteor.Error('restore-failed',
    'Could not restore this document, maybe it was removed by a parent?'
  );
};

export function restore(collectionOrName: Mongo.Collection<TreeDoc> | string, docOrId: TreeDoc | string, extraUpdates?) {

  let collection: Mongo.Collection<TreeDoc>;
  if (typeof collectionOrName === 'string') {
    collection = getCollectionByName(collectionOrName);
  } else {
    collection = collectionOrName;
  }

  let doc: TreeDoc | undefined;
  if (typeof docOrId === 'string') {
    doc = collection.findOne(docOrId);
  } else {
    doc = docOrId
  }
  if (!doc) {
    throw new Meteor.Error('not found', 'The document to remove was not found');
  }

  const numUpdated: number = collection.update({
    _id: doc._id,
    removedWith: { $exists: false }
  }, {
    $unset: {
      removed: 1,
      removedAt: 1,
    },
    ...extraUpdates
  });

  if (numUpdated === 0) restoreError();

  return collection.update({
    removedWith: doc._id,
  }, {
    $unset: {
      removed: 1,
      removedAt: 1,
      removedWith: 1,
    }
  }, {
    multi: true,
  }) + 1;
}
