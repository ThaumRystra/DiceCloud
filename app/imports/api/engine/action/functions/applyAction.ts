import { EngineAction, ActionSchema } from '/imports/api/engine/action/EngineActions';
import { getSingleProperty } from '/imports/api/engine/loadCreatures';
import applyTask from '/imports/api/engine/action/tasks/applyTask'
import { isEmpty } from 'lodash';

// TODO create a function to get the effective value of a property,
// simulating all the result updates in the action so far

// Apply an action
// This is run once as a simulation on the client awaiting all the various inputs or step through
// clicks from the user, then it is run as part of the runAction method, where it is expected to
// complete instantly on the client, and sent to the server as a method call
export async function applyAction(action: EngineAction, userInput?: any[] | Function, options?: {
  simulate?: boolean, stepThrough?: boolean
}) {
  const { simulate, stepThrough } = options || {};
  if (!simulate && stepThrough) throw 'Cannot step through unless simulating';
  if (simulate && typeof userInput !== 'function') throw 'Must provide a function to get user input when simulating';

  action._stepThrough = stepThrough;
  action._isSimulation = simulate;
  action.taskCount = 0;
  const prop = await getSingleProperty(action.creatureId, action.rootPropId);
  if (!prop) throw new Meteor.Error('Not found', 'Root action property could not be found');
  await applyTask(action, {
    prop,
    targetIds: action.targetIds || [],
  }, userInput);
  return { action, userInput };
}

function writeChangedAction(original: EngineAction, changed: EngineAction) {
  const $set = {};
  for (const key of ActionSchema.objectKeys()) {
    if (!EJSON.equals(original[key], changed[key])) {
      $set[key] = changed[key];
    }
  }
  if (!isEmpty($set) && original._id) {
    return Actions.updateAsync(original._id, { $set });
  }
}
