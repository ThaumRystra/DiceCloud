import EngineActions, { EngineAction } from '/imports/api/engine/action/EngineActions';
import mutationToPropUpdates from './mutationToPropUpdates';
import mutationToLogUpdates from '/imports/api/engine/action/functions/mutationToLogUpdates';
import { union } from 'lodash';
import CreatureLogs from '/imports/api/creature/log/CreatureLogs';
import bulkWrite from '/imports/api/engine/shared/bulkWrite';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';

export default async function writeActionResults(action: EngineAction) {
  if (!action._id) throw new Meteor.Error('type-error', 'Action does not have an _id');
  EngineActions.remove(action._id);
  const creaturePropUpdates: any[] = [];
  const logContents: any[] = [];
  // Collect all the updates and log content
  action.results.forEach(result => {
    result.mutations.forEach(mutation => {
      creaturePropUpdates.push(...mutationToPropUpdates(mutation));
      logContents.push(...mutationToLogUpdates(mutation));
    });
  });
  const allTargetIds = union(...logContents.map(c => c.targetIds));

  // Write the log
  const logPromise = CreatureLogs.insertAsync({
    content: logContents,
    creatureId: action.creatureId,
    targetIds: allTargetIds,
  });

  // Write the bulk updates
  const bulkWritePromise = bulkWrite(creaturePropUpdates, CreatureProperties);

  return Promise.all([logPromise, bulkWritePromise]);
}
