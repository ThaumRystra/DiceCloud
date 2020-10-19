const snackbarStore = {
  state: {
    snackbars: [],
    snackbarTimout: undefined,
  },
  mutations: {
    addSnackbar(state, value){
      state.snackbars.push(value)
    },
    closeCurrentSnackbar (state){
      state.snackbars.shift();
    },
    cancelSnackbarTimeout (state){
      if(state.snackbarTimout){
        clearTimeout(state.snackbarTimout);
      }
    },
    setSnackbarTimout(state, value){
      state.snackbarTimout = value;
    },
  },
  actions: {
    snackbar({dispatch, commit}, value){
      // value = {
      //   text,
      //   showCloseButton,
      //   callback,
      //   callbackName
      // }
      commit('addSnackbar', value);
      commit('setSnackbarTimout', setTimeout(() => {
        dispatch('closeSnackbar');
      }, 5000));
    },
    closeSnackbar({dispatch, commit, state}){
      commit('closeCurrentSnackbar');
      commit('cancelSnackbarTimeout');
      if (state.snackbars.length){
        commit('setSnackbarTimout', setTimeout(() => {
          dispatch('closeSnackbar');
        }, 5000));
      }
    },
  }
};

export default snackbarStore;
