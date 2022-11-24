import Vue from 'vue';
import { clone } from 'lodash';

let dialogStack = {};
dialogStack.dialogs = [];

const dialogStackStore = {
  state: {
    dialogs: [],
    currentResult: null,
    currentReturnElement: null,
  },
  mutations: {
    pushDialogStack(state, { component, data, elementId, callback }) {
      // Generate a new _id so that Vue knows how to shuffle the array
      const _id = Random.id();
      state.dialogs.push({
        _id,
        component,
        data,
        elementId,
        callback,
      });
      updateHistory();
    },
    replaceDialog(state, { component, data }) {
      if (!state.dialogs.length) {
        throw new Meteor.Error('can\'t replace dialog if no dialogs are open');
      }
      let currentDialog = state.dialogs[state.dialogs.length - 1]
      Vue.set(state.dialogs, state.dialogs.length - 1, {
        _id: currentDialog._id,
        component,
        data,
        elementId: currentDialog.elementId,
        callback: currentDialog.callback,
      });
    },
    popDialogStackMutation(state, result) {
      const dialog = state.dialogs.pop();
      state.currentResult = null;
      updateHistory();
      if (!dialog) return;
      if (dialog.callback) {
        let returnElementId = dialog.callback(result);
        state.currentReturnElement = returnElementId;
      } else {
        state.currentReturnElement = null;
      }
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
      let intervalId = setInterval(() => {
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

const updateHistory = function () {
  // history should looks like: [{openDialogs: 0}, {openDialogs: n}] where
  // n is the number of open dialogs

  // If we can't access the history object, give up
  if (!history) return;
  // Make sure that there is a state tracking open dialogs
  // replace the state without bashing it in the process
  if (!history.state || !Number.isFinite(history.state.openDialogs)) {
    let newState = clone(history.state) || {};
    newState.openDialogs = 0;
    history.replaceState(newState, '');
  }

  const numDialogs = dialogStackStore.state.dialogs.length;
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
      let newState = clone(history.state) || {};
      newState.openDialogs = dialogStackStore.state.dialogs.length;
      history.replaceState(newState, '');
    }
  } else if (numDialogs > 0 && stateDialogs === 0) {
    // On the zero state, push a dialog count
    history.pushState({ openDialogs: numDialogs }, '');
  } else {
    console.warn(
      'History could not be updated correctly, unexpected case',
      { stateDialogs, numDialogs },
    )
  }
};
