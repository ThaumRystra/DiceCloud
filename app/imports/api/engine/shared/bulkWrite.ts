// This is more efficient on the database, but significantly less efficient
// in the UI because of incompatibility with latency compensation. If the
// duplicate redraws can be fixed, this is a strictly better way of processing
// writes
export default async function bulkWrite<T>(bulkWriteOps, collection: Mongo.Collection<T>, forceSequential?: true): Promise<any> {
  if (!bulkWriteOps.length) return;
  // bulkWrite is only available on the server
  if (!Meteor.isServer || forceSequential) {
    return writePropertiesSequentially(bulkWriteOps, collection);
  }
  return collection.rawCollection().bulkWrite(
    bulkWriteOps,
    { ordered: false }
  );
}

// If we re-enable client-side sheet recalculation, this needs to be run on
// both client and server to preserve latency compensation. Bulkwrite breaks
// latency compensation and causes flickering
function writePropertiesSequentially(bulkWriteOps: any[], collection: Mongo.Collection<any>) {
  bulkWriteOps.forEach(op => {
    const insertOne = op.insertOne;
    if (insertOne) {
      collection.insert(insertOne);
    }
    const updateOneOrMany = op.updateOne || op.updateMany;
    if (updateOneOrMany) {
      collection.update(updateOneOrMany.filter, updateOneOrMany.update, {
        // The bulk code is bypassing validation, so do the same here
        // @ts-expect-error Collection 2 has no typescript support
        bypassCollection2: true,
      });
    }
  });
}

export function newOperation(_id) {
  const newOp = {
    updateOne: {
      filter: { _id },
      update: {},
    }
  };
  return newOp;
}

export function addSetOp(op, key, value) {
  if (op.updateOne.update.$set) {
    op.updateOne.update.$set[key] = value;
  } else {
    op.updateOne.update.$set = { [key]: value };
  }
}

export function addUnsetOp(op, key) {
  if (op.updateOne.update.$unset) {
    op.updateOne.update.$unset[key] = 1;
  } else {
    op.updateOne.update.$unset = { [key]: 1 };
  }
}
