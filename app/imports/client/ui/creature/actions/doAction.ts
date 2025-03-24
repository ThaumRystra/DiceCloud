import { Store } from 'vuex';
import { insertAction } from '/imports/api/engine/action/methods/insertAction';
import Task from '/imports/api/engine/action/tasks/Task';
import EngineActions, { EngineAction } from '/imports/api/engine/action/EngineActions';
import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';
import applyAction from '/imports/api/engine/action/functions/applyAction';
import { runAction } from '/imports/api/engine/action/methods/runAction';
import getDeterministicDiceRoller from '/imports/api/engine/action/functions/userInput/getDeterministicDiceRoller';
import { getSingleProperty } from '../../../../api/engine/loadCreatures';

type BaseDoActionParams = {
  creatureId: string;
  $store: Store<any>;
  elementId: string;
  callback?: (action: EngineAction) => void;
  replaceDialog?: boolean;
}

type DoTaskParams = BaseDoActionParams & {
  task: Task;
  propId?: undefined;
  targetIds?: undefined;
}

type DoActionParams = BaseDoActionParams & {
  propId: string;
  targetIds: string[];
  task?: undefined;
}

/**
 * Apply an action on the client that first creates the action on both the client and server, then 
 * simulates the action, opening the action dialog if necessary to get input from the user, saving
 * the decisions the user makes, then applying the  action as a method call to the server with the
 * saved decisions, which will persist the action results.
 */
export default async function doAction({
  propId, creatureId, $store, elementId, task, targetIds, callback, replaceDialog
}: DoActionParams | DoTaskParams): Promise<any | void> {
  if (!task) {
    targetIds ??= [];
    if (!propId) throw new Meteor.Error('no-prop-id', 'Either propId or task must be provided');
    const prop = getSingleProperty(creatureId, propId);
    if (!prop) throw new Meteor.Error('not-found', 'Property not found');
    task = {
      prop,
      targetIds,
      subtaskFn: undefined,
    };
  }
  // Create the action
  const actionId = insertAction.call({
    action: {
      creatureId,
      task,
      results: [],
      taskCount: 0,
      _decisions: [],
    }
  });

  // Get the inserted and cleaned action instance
  const action = EngineActions.findOne(actionId);

  if (!action) throw new Meteor.Error('not-found', 'The action could not be found');

  // Applying the action is deterministic, so we apply it, if it asks for user input, we escape and 
  // create a dialog that will re-apply the action, but with the ability to actually get input
  // Either way, call the action method afterwards
  try {
    if (!action._id) throw new Meteor.Error('no-action-id', 'Action ID is required');
    const finishedAction = await applyAction(
      action, getErrorOnInputRequestProvider(action._id), { simulate: true }
    );
    if (replaceDialog) {
      $store.dispatch('popDialogStack', finishedAction);
    }
    return callActionMethod(finishedAction);
  } catch (e) {
    if (e !== 'input-requested') throw e;
    return new Promise<void>((resolve) => {
      $store.commit(replaceDialog ? 'replaceDialog' : 'pushDialogStack', {
        component: 'action-dialog',
        elementId,
        data: {
          actionId,
          task,
          actionFinishedCallback: resolve,
        },
        callback(action: any) {
          resolve();
          return callback?.(action);
        },
      });
    });
  }
}

const callActionMethod = (action: EngineAction) => {
  if (!action._id) throw new Meteor.Error('type-error', 'Action must have and _id');
  return runAction.callAsync({ actionId: action._id, decisions: action._decisions });
}

const throwInputRequestedError = () => {
  throw 'input-requested';
}

function getErrorOnInputRequestProvider(actionId: string) {
  const errorOnInputRequest: InputProvider = {
    targetIds: throwInputRequestedError,
    nextStep: throwInputRequestedError,
    rollDice: getDeterministicDiceRoller(actionId),
    choose: throwInputRequestedError,
    advantage: throwInputRequestedError,
    check: throwInputRequestedError,
  }
  return errorOnInputRequest;
}
