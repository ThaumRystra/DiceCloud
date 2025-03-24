import { Mutation } from '/imports/api/engine/action/tasks/TaskResult';
import { newOperation } from '/imports/api/engine/shared/bulkWrite';

export default function mutationToPropUpdates(mutation: Mutation) {
  const bulkWriteOps: any[] = [];
  // Updates to creature properties
  if (mutation.updates) {
    const propUpdatesById: Record<string, any> = {};
    for (const update of mutation.updates) {
      if (!propUpdatesById[update.propId]) {
        propUpdatesById[update.propId] = newOperation(update.propId);
      }
      if (update.set) {
        propUpdatesById[update.propId].updateOne.update.$set = {
          ...propUpdatesById[update.propId].updateOne.update.$set,
          ...update.set,
        };
      }
      if (update.inc) {
        propUpdatesById[update.propId].updateOne.update.$inc = {
          ...propUpdatesById[update.propId].updateOne.update.$inc,
          ...update.inc,
        };
      }
    }
    for (const id in propUpdatesById) {
      bulkWriteOps.push(propUpdatesById[id]);
    }
  }
  // Insert creature properties
  if (mutation.inserts) for (const insertOne of mutation.inserts) {
    bulkWriteOps.push({
      insertOne
    });
  }
  // Remove creature properties
  if (mutation.removals) for (const removeOne of mutation.removals) {
    bulkWriteOps.push({
      deleteOne: {
        filter: {
          _id: removeOne.propId
        },
      },
    });
  }
  return bulkWriteOps;
}
