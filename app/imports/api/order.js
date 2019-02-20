const getHighestOrder = function({collection, charId}){
  const highestOrderedDoc = collection.findOne({
    charId
  }, {
    fields: {order: 1},
    sort: {order: -1},
  });
  return (highestOrderedDoc && highestOrderedDoc.order) || 0;
}

const moveDocToOrder = function({collection, doc, order}){
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
      charId: doc.charId,
    }, {
      $inc: {order: increment},
    }, {
      multi: true,
    });
  }
};

const reorderDocs = function({collection, charId}){
  let bulkWrite = [];
  collection.find({
    charId
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
};

export { getHighestOrder, moveDocToOrder, reorderDocs };
