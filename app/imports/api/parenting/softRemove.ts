import { getCollectionByName, getFilter } from '/imports/api/parenting/parentingFunctions';
import { TreeDoc } from '/imports/api/parenting/ChildSchema';

export async function softRemove(collection: Mongo.Collection<TreeDoc> | string, doc?: TreeDoc | string) {
  const removalDate = new Date();
  if (typeof collection === 'string') {
    collection = getCollectionByName(collection);
  }
  if (typeof doc === 'string') {
    doc = await collection.findOneAsync(doc);
  }
  if (!doc) {
    throw new Meteor.Error('not found', 'The document to remove was not found');
  }
  // Remove this document
  const removeDocPromise = collection.updateAsync(
    doc._id,
    {
      $set: {
        removed: true,
        removedAt: removalDate,
      },
      $unset: {
        removedWith: 1,
      }
    }, {
    selector: { type: 'any' },
  },
  );
  // Remove all the descendants that have not yet been removed, and set them to be
  // removed with this document
  const removeDescendantsPromise = collection.updateAsync({
    ...getFilter.descendants(doc),
    removed: { $ne: true },
  }, {
    $set: {
      removed: true,
      removedAt: removalDate,
      removedWith: doc._id,
    }
  }, {
    selector: { type: 'any' },
    multi: true,
  });
  return Promise.all([removeDocPromise, removeDescendantsPromise]);
}

const restoreError = function () {
  throw new Meteor.Error('restore-failed',
    'Could not restore this document, maybe it was removed by a parent?'
  );
};

export async function restore(collection: Mongo.Collection<TreeDoc> | string, doc: TreeDoc | string, extraUpdates?) {
  if (typeof collection === 'string') {
    collection = getCollectionByName(collection);
  }
  if (typeof doc === 'string') {
    const foundDoc = await collection.findOneAsync(doc)
    if (!foundDoc) {
      throw new Meteor.Error('not found', 'The document to remove was not found');
    }
    doc = foundDoc;
  }
  const numUpdated: number = await collection.updateAsync({
    _id: doc._id,
    removedWith: { $exists: false }
  }, {
    $unset: {
      removed: 1,
      removedAt: 1,
    },
    ...extraUpdates
  }, {
    selector: { type: 'any' },
  });
  if (numUpdated === 0) restoreError();
  return collection.updateAsync({
    removedWith: doc._id,
  }, {
    $unset: {
      removed: 1,
      removedAt: 1,
      removedWith: 1,
    }
  }, {
    selector: { type: 'any' },
    multi: true,
  });
}
