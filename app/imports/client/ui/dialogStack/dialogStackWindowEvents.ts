import store from '/imports/client/ui/vuexStore';

if (window) {
  window.onpopstate = function (event) {
    const state = event.state;
    // @ts-expect-error store modules don't have types
    const numDialogs = store.state?.dialogStack.dialogs.length;
    if (Number.isFinite(state.openDialogs) && numDialogs > state.openDialogs) {
      // @ts-expect-error store modules don't have types
      store.commit('popDialogStackMutation', store.state.dialogStack.currentResult);
    }
  };
}
