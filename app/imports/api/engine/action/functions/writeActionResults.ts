import EngineActions, { EngineAction } from '/imports/api/engine/action/EngineActions';
import mutationToPropUpdates from './mutationToPropUpdates';
import mutationToLogUpdates from '/imports/api/engine/action/functions/mutationToLogUpdates';
import { union } from 'lodash';
import CreatureLogs from '/imports/api/creature/log/CreatureLogs';
import bulkWrite from '/imports/api/engine/shared/bulkWrite';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import Creatures from '/imports/api/creature/creatures/Creatures';

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
  });

  // Write the bulk updates
  const bulkWritePromise = bulkWrite(creaturePropUpdates, CreatureProperties);

  // Mark the creatures as dirty
  const creaturePromise = Creatures.updateAsync({
    _id: { $in: [action.creatureId, ...allTargetIds] },
  }, {
    $set: { dirty: true },
  }, {
    multi: true,
  });

  return Promise.all([engineActionPromise, logPromise, bulkWritePromise, creaturePromise]);
}
