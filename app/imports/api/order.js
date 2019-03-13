import SimpleSchema from 'simpl-schema';

export function getHighestOrder({collection, charId}){
  const highestOrderedDoc = collection.findOne({
    charId
  }, {
    fields: {order: 1},
    sort: {order: -1},
  });
  return (highestOrderedDoc && highestOrderedDoc.order) || 0;
};

export function setDocToLastOrder({collection, doc}){
  doc.order = getHighestOrder({
    collection,
    charId: doc.charId,
  }) + 1;
};

export function setDocToLastMixin(methodOptions){
  // Make sure the doc has a charId
  // This mixin should come before simpleSchemaMixin
  methodOptions.schema.extend({
    charId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  });
  let collection = methodOptions.collection
  if (!collection){
    throw "`collection` required in method options for setDocToLastMixin"
  }
  let runFunc = methodOptions.run;
  methodOptions.run = function(doc){
    setDocToLastOrder({collection, doc});
    return runFunc.apply(this, arguments);
  };
  return methodOptions;
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
      charId: doc.charId,
    }, {
      $inc: {order: increment},
    }, {
      multi: true,
    });
  }
};

export function reorderDocs({collection, charId}){
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
