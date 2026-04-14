import { clone } from 'lodash';
import type { Module } from 'vuex';

type Dialog<T, U> = {
  _id: string;
  component: string;
  data: T;
  elementId: string;
  callback: (args: U) => string | void;
}

export type DialogStackStoreState = {
  dialogs: Dialog<Record<string, unknown>, unknown>[],
  currentResult: unknown,
  currentReturnElement: string | null,
  replacingDialog: string | null,
};

const dialogStackStore: Module<DialogStackStoreState, unknown> = {
  state: () => ({
    dialogs: [],
    currentResult: null,
    currentReturnElement: null,
    replacingDialog: null,
  }),
  mutations: {
    pushDialogStack(state, { component, data, elementId, callback }: Dialog<Record<string, unknown>, unknown>) {
      // Generate a new _id so that Vue knows how to shuffle the array
      const _id = Random.id();
      state.dialogs.push({
        _id,
        component,
        data,
        elementId,
        callback,
      });
      updateHistory(state);
    },
    replaceDialog(state, { component, data, elementId, callback }: Dialog<Record<string, unknown>, unknown>) {
      if (!state.dialogs.length) {
        throw new Meteor.Error('can\'t replace dialog if no dialogs are open');
      }
      const currentDialog = state.dialogs[state.dialogs.length - 1]
      state.replacingDialog = currentDialog._id;
      state.dialogs[state.dialogs.length - 1] = {
        _id: Random.id(),
        component,
        data,
        elementId: elementId || currentDialog._id,
        callback: (...args) => {
          callback?.(...args);
          return currentDialog.callback?.(...args);
        },
      };
    },
    popDialogStackMutation(state, result) {
      const dialog = state.dialogs.pop();
      state.currentResult = null;
      updateHistory(state);
      state.currentReturnElement = dialog?.callback?.(result) ?? null;
    },
    setCurrentResult(state, result) {
      state.currentResult = result;
    },
  },
  actions: {
    popDialogStack(context, result) {
      if (history && history.state && history.state.openDialogs) {
        context.commit('setCurrentResult', result);
        history.back();
      } else {
        context.commit('popDialogStackMutation', result);
      }
    },
    popDialogStacks(context, quantity) {
      if (quantity <= 0) return;
      let iterationsLeft = quantity;
      const intervalId = setInterval(() => {
        if (history && history.state && history.state.openDialogs) {
          context.commit('setCurrentResult');
          history.back();
        } else {
          context.commit('popDialogStackMutation');
        }
        iterationsLeft -= 1;
        if (iterationsLeft === 0) {
          clearInterval(intervalId);
        }
      }, 150);
    },
  },
};

export default dialogStackStore;

const updateHistory = function (state: DialogStackStoreState) {
  // history should looks like: [{openDialogs: 0}, {openDialogs: n}] where
  // n is the number of open dialogs

  // If we can't access the history object, give up
  if (!history) return;
  // Make sure that there is a state tracking open dialogs
  // replace the state without bashing it in the process
  if (!history.state || !Number.isFinite(history.state.openDialogs)) {
    const newState = clone(history.state) || {};
    newState.openDialogs = 0;
    history.replaceState(newState, '');
  }

  const numDialogs = state.dialogs.length;
  const stateDialogs = history.state.openDialogs;

  // If the number of dialogs and state dialogs are equal, we don't need to do
  // anything
  if (numDialogs === stateDialogs) return;

  if (stateDialogs > 0) {
    // On a dialog count
    if (numDialogs === 0) {
      // but shouldn't be
      history.back();
    } else {
      // but should replace with correct count
      const newState = clone(history.state) || {};
      newState.openDialogs = state.dialogs.length;
      history.replaceState(newState, '');
    }
  } else if (numDialogs > 0 && stateDialogs === 0) {
    // On the zero state, push a dialog count
    history.pushState({ openDialogs: numDialogs }, '');
  } else {
    console.warn(
      'History could not be updated correctly, unexpected case',
      { stateDialogs, numDialogs },
    );
  }
};
