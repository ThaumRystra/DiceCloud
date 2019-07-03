import SimpleSchema from 'simpl-schema';

export function getHighestOrder({collection, rootAncestor}){
  const highestOrderedDoc = collection.findOne({
    'ancestors.0': rootAncestor,
  }, {
    fields: {order: 1},
    sort: {order: -1},
  });
  return (highestOrderedDoc && highestOrderedDoc.order) || 0;
}

export function setDocToLastOrder({collection, doc}){
  doc.order = getHighestOrder({
    collection,
    rootAncestor: doc.ancestors[0],
  }) + 1;
}

export function setDocOrder({collection, doc, order}){
  const currentOrder = doc.order;
  if (currentOrder === order){
    return;
  } else {
    // Move the document to its new order
    collection.update(doc._id, {$set: {order}});
    let inBetweenSelector, increment;
    if (order > currentOrder){
      // Move in-between docs backward
      inBetweenSelector = [
        {$gt: currentOrder},
        {$lte: order},
      ];
      increment = -1;
    } else if (order < currentOrder){
      // Move in-between docs forward
      inBetweenSelector = [
        {$lt: currentOrder},
        {$gte: order},
      ];
      increment = 1;
    }
    collection.update({
      order: {$and: inBetweenSelector},
      rootAncestor: doc.ancestors[0],
    }, {
      $inc: {order: increment},
    }, {
      multi: true,
    });
  }
}

export function reorderDocs({collection, rootAncestor}){
  let bulkWrite = [];
  collection.find({
    'ancestors.0': rootAncestor,
  }, {
    fields: {order: 1},
    sort: {order: 1}
  }).forEach((doc, index) => {
    if (doc.order !== index){
      bulkwrite.push({
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
      collection.update(op.filter, op.update);
    });
  }
}
