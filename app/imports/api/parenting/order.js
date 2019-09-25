import fetchDocByRef from '/imports/api/parenting/fetchDocByRef.js';
import getCollectionByName from '/imports/api/parenting/getCollectionByName.js';

// Docs keep track of their order amongst their siblings and keep a copy of the
// order of their ancestors. Order is first compared between oldest non-shared
// ancestors, then by ancestors before children, then between order of siblings.
export function compareOrder(docA, docB){
  // < 0 if A comes before B
  // = 0 if A and B are the same order
  // > 0 if B comes before A

  // Documents are equal order to themselves
  if (docA._id && docB._id && docA._id === docB._id){
    return 0;
  }

  // If they are siblings, just compare order
  if (docA.parent.id === docB.parent.id){
    return docA.order - docB.order;
  }

  // They must share a root ancestor to be meaningfully sorted
  if (docA.ancestors[0].id !== docB.ancestors[0].id){
    return 0;
  }

  // Go through their ancestors after the root, and find the first order
  // difference
  let i, difference;
  const length = Math.min(docA.ancestors.length, docB.ancestors.length);
  for (i = 1; i < length; i++){
    difference = docA.ancestors[i].order - docB.ancestors[i].order;
    if (difference){
      return difference;
    } else if (docA.ancestors[i].id !== docB.ancestors[i].id) {
      throw new Meteor.Error('Sibling order clash',
        'Sibling docs share the same order, sort failed');
    }
  }

  // We haven't returned yet, all ancestors up to this point are shared and one
  // doc has no more ancestors implying one is an ancestor of the other,
  // return the difference in their ancestor list lengths, shorter comes first
  return docA.ancestors.length - docB.ancestors.length
}

export function getHighestOrder({collection, parentId}){
  const highestOrderedDoc = collection.findOne({
    'parent.id': parentId,
  }, {
    fields: {order: 1},
    sort: {order: -1},
  });
  return highestOrderedDoc ? highestOrderedDoc.order : -1;
}

export function setDocToLastOrder({collection, doc}){
  doc.order = getHighestOrder({
    collection,
    parentId: doc.parent.id,
  }) + 1;
}

// update the order of a doc, and shift the siblings around to suit the new
// order
export function updateDocOrder({docRef, order}){
  let doc = fetchDocByRef(docRef, {fields: {
    order: 1,
    parent: 1,
  }});
  let collection = getCollectionByName(docRef.collection);
  const currentOrder = doc.order;
  if (currentOrder === order){
    return;
  } else {
    // First move the documents that are in the way
    let inBetweenSelector, increment;
    if (order > currentOrder){
      // Move in-between docs backward
      inBetweenSelector = {
        $gt: currentOrder,
        $lte: order
      };
      increment = -1;
    } else if (order < currentOrder){
      // Move in-between docs forward
      inBetweenSelector = {
        $lt: currentOrder,
        $gte: order
      };
      increment = 1;
    }
    collection.update({
      'parent.id': doc.parent.id,
      order: inBetweenSelector,
    }, {
      $inc: {order: increment},
    }, {
      multi: true,
      selector: {type: 'any'},
    });
    // Then move the document itself
    collection.update(doc._id, {$set: {order}}, {selector: {type: 'any'}});
  }
}

export function removedDocAtOrder({collection, doc}){
  // Decrement the order of all docs after the removed doc
  collection.update({
    'parent.id': doc.parent.id,
    order: {$gt: doc.order},
  }, {
    $inc: {order: -1},
  }, {
    multi: true,
    selector: {type: 'any'},
  });
}

export function insertedDocAtOrder({collection, parentId, order}){
  // Increment the order of all docs after the inserted doc
  collection.update({
    'parent.id': parentId,
    order: {$gte: order},
  }, {
    $inc: {order: 1},
  }, {
    multi: true,
    selector: {type: 'any'},
  });
}

// Update the order a single doc and re-order the entire sibling list
// with the change
export function safeUpdateDocOrder({docRef, order}){
  let collection = getCollectionByName(docRef.collection);
  let movedDoc = fetchDocByRef(docRef, {fields: {
    parent: 1, name: 1
  }});
  let parentId = movedDoc.parent.id;
  let bulkWrite = [];
  let docs = collection.find({
    'parent.id': parentId,
    '_id': {$ne: movedDoc._id},
  }, {
    fields: {order: 1, name: 1},
    sort: {order: 1}
  }).fetch();
  docs.splice(order, 0, movedDoc);
  docs.forEach((doc, index) => {
    if (doc.order !== index){
      bulkWrite.push({
        updateOne: {
          filter: {_id: doc._id},
          update: {$set: {order: index}},
        },
      });
    }
  });
  if (Meteor.isServer){
    collection.rawCollection().bulkWrite(bulkWrite);
  } else {
    bulkWrite.forEach(op => {
      collection.update(
        op.updateOne.filter,
        op.updateOne.update,
        {selector: {type: 'any'}}
      );
    });
  }
};

export function reorderDocs({collection, parentId}){
  let bulkWrite = [];
  collection.find({
    'parent.id': parentId,
  }, {
    fields: {order: 1},
    sort: {order: 1}
  }).forEach((doc, index) => {
    if (doc.order !== index){
      bulkWrite.push({
        updateOne : {
          filter: {_id: doc._id},
          update: {$set: {order: index}},
        },
      });
    }
  });
  if (Meteor.isServer){
    collection.rawCollection().bulkWrite(bulkWrite);
  } else {
    bulkWrite.forEach(op => {
      collection.update(op.updateOne.filter, op.updateOne.update);
    });
  }
}
