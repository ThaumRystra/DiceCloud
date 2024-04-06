import { Store } from 'vuex';
import { insertAction } from '/imports/api/engine/action/methods/insertAction';
import Task from '/imports/api/engine/action/tasks/Task';
import EngineActions, { EngineAction } from '/imports/api/engine/action/EngineActions';
import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';
import applyAction from '/imports/api/engine/action/functions/applyAction';
import { runAction } from '/imports/api/engine/action/methods/runAction';

/**
 * Apply an action on the client that first creates the action on both the client and server, then 
 * simulates the action, opening the action dialog if necessary to get input from the user, saving
 * the decisions the user makes, then applying the  action as a method call to the server with the
 * saved decisions, which will persist the action results.
 * 
 * @param prop The property initializing the action, if no task is applied the property will be 
 * applied as the starting point of the action
 * @param $store The Vuex store instance that has the dialog stack
 * @param elementId The element to animate the dialog from if a dialog needs to open
 * @param task The task to apply instead of applying the property itself
 */
export default async function doAction(
  prop: { _id: string, root: { id: string } },
  $store: Store<any>,
  elementId: string,
  task?: Task,
) {
  // Create the action
  const actionId = insertAction.call({
    action: {
      creatureId: prop.root.id,
      rootPropId: prop._id,
      results: [],
      taskCount: 0,
    }
  });

  // Get the inserted and cleaned action instance
  const action = EngineActions.findOne(actionId);

  if (!action) throw new Meteor.Error('not-found', 'The action could not be found');

  // Applying the action is deterministic, so we apply it, if it asks for user input, we escape and 
  // create a dialog that will re-apply the action, but with the ability to actually get input
  // Either way, call the action method afterwards
  try {
    const finishedAction = await applyAction(
      action, errorOnInputRequest, { simulate: true, task }
    );
    return callActionMethod(finishedAction);
  } catch (e) {
    if (e !== 'input-requested') throw e;
    return new Promise(resolve => {
      $store.commit('pushDialogStack', {
        component: 'action-dialog',
        elementId,
        data: {
          actionId,
        },
        async callback(action: EngineAction) {
          resolve(await callActionMethod(action));
        },
      });
    })
  }
}

const callActionMethod = (action: EngineAction) => {
  if (!action._id) throw new Meteor.Error('type-error', 'Action must have and _id');
  return runAction.callAsync({ actionId: action._id, decisions: action._decisions });
}

const throwInputRequestedError = () => {
  throw 'input-requested';
}

const errorOnInputRequest: InputProvider = {
  nextStep: throwInputRequestedError,
  rollDice: throwInputRequestedError,
  choose: throwInputRequestedError,
  advantage: throwInputRequestedError,
}
