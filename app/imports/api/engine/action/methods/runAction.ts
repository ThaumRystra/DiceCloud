import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import EngineActions from '/imports/api/engine/action/EngineActions';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import { getCreature } from '/imports/api/engine/loadCreatures';
import applyAction from '/imports/api/engine/action/functions/applyAction';
import writeActionResults from '../functions/writeActionResults';
import getReplayChoicesInputProvider from '/imports/api/engine/action/functions/userInput/getReplayChoicesInputProvider';
import Task from '/imports/api/engine/action/tasks/Task';

export const runAction = new ValidatedMethod({
  name: 'actions.runAction',
  validate: null, //TODO validate this
  run: async function ({ actionId, decisions = [], task }: { actionId: string, decisions?: any[], task?: Task }) {
    // Get the action
    const action = await EngineActions.findOneAsync(actionId);
    if (!action) throw new Meteor.Error('not-found', 'Action not found');

    // Permissions
    assertEditPermission(getCreature(action.creatureId), this.userId);

    // Replay the user's decisions as user input
    const userInput = getReplayChoicesInputProvider(actionId, decisions);

    // Apply the action
    await applyAction(action, userInput, { task });

    // Persist changes
    const writePromise = writeActionResults(action);
    return writePromise;
  },
});
