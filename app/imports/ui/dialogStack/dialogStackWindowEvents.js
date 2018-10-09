import store from "/imports/ui/vuexStore.js";

if (window){
  window.onpopstate = function(event){
    let state = event.state;
    let numDialogs = store.state.dialogStack.dialogs.length;
    if (_.isFinite(state.openDialogs) && numDialogs > state.openDialogs){
      store.commit("popDialogStackMutation");
    }
  };
}
