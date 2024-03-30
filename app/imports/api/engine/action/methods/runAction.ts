import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import EngineActions from '/imports/api/engine/action/EngineActions';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import { getCreature } from '/imports/api/engine/loadCreatures';
import applyAction from '/imports/api/engine/action/functions/applyAction';
import writeChangedAction from '../functions/writeChangedAction';
import getReplayChoicesInputProvider from '/imports/api/engine/action/functions/userInput/getReplayChoicesInputProvider';

export const runAction = new ValidatedMethod({
  name: 'actions.runAction',
  validate: new SimpleSchema({
    action: {
      type: Object,
      blackbox: true,
    },
    decisions: {
      type: Array,
    },
    'decisions.$': {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  run: async function ({ actionId, decisions }: { actionId: string, decisions: any[] }) {
    // Get the action
    const action = await EngineActions.findOneAsync(actionId);
    if (!action) throw new Meteor.Error('not-found', 'Action not found');

    // Permissions
    assertEditPermission(getCreature(action.creatureId), this.userId);

    // Keep a copy of the original so that a diff can be done later to store what changed
    const originalAction = EJSON.clone(action);

    // Replay the user's decisions as user input
    const userInput = getReplayChoicesInputProvider(actionId, decisions);

    // Apply the action
    applyAction(action, userInput);

    // Persist changes
    const writePromise = writeChangedAction(originalAction, action);
    return writePromise;
  },
});
