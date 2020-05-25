import fetchDocByRef from '/imports/api/parenting/fetchDocByRef.js';
import getCollectionByName from '/imports/api/parenting/getCollectionByName.js';
import getDescendantsInDepthFirstOrder from '/imports/api/parenting/getDescendantsInDepthFirstOrder.js'

// Docs keep track of their depth-first order amongst their entire ancestor tree
export function compareOrder(docA, docB){
  // < 0 if A comes before B
  // = 0 if A and B are the same order
  // > 0 if B comes before A

  // They must share a root ancestor to be meaningfully sorted
  if (docA.ancestors[0].id !== docB.ancestors[0].id){
    return 0;
  } else {
    return docA.order - docB.order;
  }
}

export function getHighestOrder({collection, ancestorId}){
  const highestOrderedDoc = collection.findOne({
    'ancestors.id': ancestorId,
  }, {
    fields: {order: 1},
    sort: {order: -1},
  });
  return highestOrderedDoc ? highestOrderedDoc.order : -1;
}

export function setDocToLastOrder({collection, doc}){
  doc.order = getHighestOrder({
    collection,
    ancestorId: doc.ancestors[0].id,
  }) + 1;
}

// update the order of a doc, and shift the related docs around to suit the new
// order
function cheapUpdateDocOrder({docRef, order}){
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
      'ancestors.id': doc.ancestors[0].id,
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

export function cheapRemovedDocAtOrder({collection, doc}){
  // Decrement the order of all docs after the removed doc
  collection.update({
    'ancestors.id': doc.ancestors[0].id,
    order: {$gt: doc.order},
  }, {
    $inc: {order: -1},
  }, {
    multi: true,
    selector: {type: 'any'},
  });
}

export function cheapInsertedDocAtOrder({collection, ancestorId, order}){
  // Increment the order of all docs after the inserted doc
  collection.update({
    'ancestors.id': ancestorId,
    order: {$gte: order},
  }, {
    $inc: {order: 1},
  }, {
    multi: true,
    selector: {type: 'any'},
  });
}

// Update the order a single doc and re-order the entire related doc list
// with the change
export function safeUpdateDocOrder({docRef, order}){
  let collection = getCollectionByName(docRef.collection);
  // Put the new doc half a step in front of its new order
  // to ensure it's in front of whichever doc was there before
  collection.update(docRef.id, {
    $set: {order}
  }, {
    selector: {type: 'any'}
  });
  // reorder all related docs so that order is back to being a continous
  // set of whole numbers
  let movedDoc = fetchDocByRef(docRef, {fields: {ancestors: 1}});
  let ancestorId = movedDoc.ancestors[0].id;
  reorderDocs({collection, ancestorId});
}

export function reorderDocs({collection, ancestorId}){
  let orderedDocs = getDescendantsInDepthFirstOrder({collection, ancestorId});
  let bulkWrite = [];
  orderedDocs.forEach((doc, index) => {
    if (doc.order !== index){
      bulkWrite.push({
        updateOne : {
          filter: {_id: doc._id},
          update: {$set: {order: index}},
        },
      });
    }
  });
  if (Meteor.isServer && bulkWrite.length){
    collection.rawCollection().bulkWrite(
      bulkWrite,
      {ordered : false},
      function(e){
        if (e) {
          console.error('Bulk write failed: ');
          console.error(e);
        }
      }
    );
  } else {
    bulkWrite.forEach(op => {
      collection.update(
        op.updateOne.filter,
        op.updateOne.update,
        {selector: {type: 'any'}}
      );
    });
  }
}
