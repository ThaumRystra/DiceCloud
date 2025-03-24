import EngineActions, { EngineAction } from '/imports/api/engine/action/EngineActions';
import mutationToPropUpdates from './mutationToPropUpdates';
import mutationToLogUpdates from '/imports/api/engine/action/functions/mutationToLogUpdates';
import { union, uniq } from 'lodash';
import CreatureLogs from '/imports/api/creature/log/CreatureLogs';
import bulkWrite from '/imports/api/engine/shared/bulkWrite';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import computeCreature from '/imports/api/engine/computeCreature';

export default async function writeActionResults(action: EngineAction) {
  if (!action._id) throw new Meteor.Error('type-error', 'Action does not have an _id');
  const engineActionPromise = EngineActions.removeAsync(action._id);
  const creaturePropUpdates: any[] = [];
  const logContents: any[] = [];

  // Collect all the updates and log content
  action.results.forEach(result => {
    result.mutations.forEach(mutation => {
      creaturePropUpdates.push(...mutationToPropUpdates(mutation));
      logContents.push(...mutationToLogUpdates(mutation));
    });
  });
  const allTargetIds: string[] = union(...logContents.map(c => c.targetIds));

  // Write the log
  const logPromise = CreatureLogs.insertAsync({
    content: logContents,
    creatureId: action.creatureId,
    tabletopId: action.tabletopId,
    actionId: action._id,
  });

  // Write the bulk updates, force them to sequential mode means we immediately get the results
  // in the subscription, rather than waiting for oplog tailing to catch up
  const bulkWritePromise = bulkWrite(creaturePropUpdates, CreatureProperties, true);

  await Promise.all([engineActionPromise, logPromise, bulkWritePromise]);

  // Recompute the creatures involved
  const recomputePromises = uniq([action.creatureId, ...allTargetIds]).map(creatureId => computeCreature(creatureId));

  return Promise.all(recomputePromises);
}
