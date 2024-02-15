import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import EngineActions from '/imports/api/engine/action/EngineActions';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import { getCreature } from '/imports/api/engine/loadCreatures';

export const runAction = new ValidatedMethod({
  name: 'actions.runAction',
  validate: new SimpleSchema({
    action: {
      type: Object,
      blackbox: true,
    },
    userInput: {
      type: Object,
      blackbox: true,
      optional: true,
    },
    stepThrough: {
      type: Boolean,
      optional: true,
    }
  }).validator(),
  run: async function ({ actionId, userInput }: { actionId: string, userInput?: any }) {
    const action = await EngineActions.findOneAsync(actionId);
    if (!action) throw 'Action not found';
    assertEditPermission(getCreature(action.creatureId), this.userId);
    const originalAction = EJSON.clone(action);
    applyAction(action, userInput);
    // Persist changes to the action
    const writePromise = writeChangedAction(originalAction, action);
    return writePromise;
  },
});
