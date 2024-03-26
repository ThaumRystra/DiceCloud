import { EngineAction } from '/imports/api/engine/action/EngineActions';
import { getSingleProperty } from '/imports/api/engine/loadCreatures';
import applyTask from '/imports/api/engine/action/tasks/applyTask'
import InputProvider from '/imports/api/engine/action/functions/InputProvider';

// TODO create a function to get the effective value of a property,
// simulating all the result updates in the action so far

// Apply an action
// This is run once as a simulation on the client awaiting all the various inputs or step through
// clicks from the user, then it is run as part of the runAction method, where it is expected to
// complete instantly on the client, and sent to the server as a method call
export default async function applyAction(action: EngineAction, userInput: InputProvider, options?: {
  simulate?: boolean, stepThrough?: boolean
}) {
  const { simulate, stepThrough } = options || {};
  if (!simulate && stepThrough) throw 'Cannot step through unless simulating';
  if (simulate && !userInput) throw 'Must provide a function to get user input when simulating';

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
