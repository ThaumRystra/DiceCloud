import { EngineAction } from '/imports/api/engine/action/EngineActions';
import { getSingleProperty } from '/imports/api/engine/loadCreatures';
import applyTask from '/imports/api/engine/action/tasks/applyTask'
import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';
import saveInputChoices from './userInput/saveInputChoices';

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

  if (action._isSimulation || action._stepThrough) {
    console.error('_isSimulation and _stepThrough should not be set on the action, rather call\
    applyAction with the appropriate options');
  }

  // If we are simulating, save the user input choices
  if (simulate) {
    userInput = saveInputChoices(action, userInput);
  }

  action._stepThrough = stepThrough;
  action._isSimulation = simulate;
  action.taskCount = 0;
  console.log(JSON.stringify(action, null, 2));
  const prop = await getSingleProperty(action.creatureId, action.rootPropId);
  if (!prop) throw new Meteor.Error('Not found', 'Root action property could not be found');
  await applyTask(action, {
    prop,
    targetIds: action.targetIds || [],
  }, userInput);
  return { action, userInput };
}
