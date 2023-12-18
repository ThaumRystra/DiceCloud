import store from '/imports/client/ui/vuexStore';

if (window) {
  window.onpopstate = function (event) {
    let state = event.state;
    let numDialogs = store.state.dialogStack.dialogs.length;
    if (Number.isFinite(state.openDialogs) && numDialogs > state.openDialogs) {
      store.commit('popDialogStackMutation', store.state.dialogStack.currentResult);
    }
  };
}
