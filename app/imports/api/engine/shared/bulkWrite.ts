// This is more efficient on the database, but significantly less efficient
// in the UI because of incompatibility with latency compensation. If the
// duplicate redraws can be fixed, this is a strictly better way of processing

import type { AnyBulkWriteOperation, Document, Collection as MongoCollection } from 'mongodb';

// writes
export default async function bulkWrite<T extends Document>(bulkWriteOps: AnyBulkWriteOperation<T>[], collection: Mongo.Collection<T>, forceSequential?: true) {
  if (!bulkWriteOps.length) return;
  // bulkWrite is only available on the server
  if (!Meteor.isServer || forceSequential) {
    return writePropertiesSequentially(bulkWriteOps, collection);
  }
  return (collection.rawCollection() as MongoCollection<T>).bulkWrite(
    bulkWriteOps,
    { ordered: false }
  );
}

// If we re-enable client-side sheet recalculation, this needs to be run on
// both client and server to preserve latency compensation. Bulkwrite breaks
// latency compensation and causes flickering
async function writePropertiesSequentially<T extends object>(bulkWriteOps: AnyBulkWriteOperation<T>[], collection: Mongo.Collection<T>) {
  for (const op of bulkWriteOps) {
    if ('insertOne' in op && op.insertOne.document) {
      await collection.insertAsync(op.insertOne.document as unknown as Mongo.OptionalId<T>);
    }
    const updateOneOrMany = ('updateOne' in op && op.updateOne) || ('updateMany' in op && op.updateMany);
    if (updateOneOrMany) {
      await collection.updateAsync(updateOneOrMany.filter as Mongo.Selector<T>, updateOneOrMany.update as Mongo.Modifier<T>, {
        // The bulk code is bypassing validation, so do the same here
        // @ts-expect-error Collection 2 has no typescript support
        bypassCollection2: true,
      });
    }
  }
}

export function newOperation(_id: string) {
  const newOp = {
    updateOne: {
      filter: { _id },
      update: {},
    }
  };
  return newOp;
}

type UpdateOneOp<T> = {
  updateOne: {
    filter: Mongo.Selector<T>;
    update: {
      $set?: (Partial<T>) | undefined;
      $unset?: Partial<Record<keyof T, 1>> | undefined;
    }
  }
}

export function addSetOp<T, K extends keyof T>(op: UpdateOneOp<T>, key: K, value: T[K]) {
  if (!op.updateOne.update.$set) op.updateOne.update.$set = {};
  op.updateOne.update.$set[key] = value;
}

export function addUnsetOp<T, K extends keyof T>(op: UpdateOneOp<T>, key: K) {
  if (!op.updateOne.update.$unset) op.updateOne.update.$unset = {};
  op.updateOne.update.$unset[key] = 1;
}
