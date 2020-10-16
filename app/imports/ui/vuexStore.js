import Vue from 'vue';
import Vuex from 'vuex';
import dialogStackStore from '/imports/ui/dialogStack/dialogStackStore.js';

Vue.use(Vuex);
const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    dialogStack: dialogStackStore,
  },
  state: {
    drawer: undefined,
    rightDrawer: undefined,
    pageTitle: undefined,
    snackbars: [],
    snackbarTimout: undefined,
  },
  mutations: {
    toggleDrawer (state) {
      state.drawer = !state.drawer;
    },
    toggleRightDrawer (state) {
      state.rightDrawer = !state.rightDrawer;
    },
    setDrawer (state, value) {
      state.drawer = value;
    },
    setRightDrawer (state, value) {
      state.rightDrawer = value;
    },
    setPageTitle (state, value) {
      state.pageTitle = value;
      document.title = value;
    },
    addSnackbar(state, value){
      value.open = true;
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
    snackbar({commit}, value){
      // value = {
      //   text,
      //   showCloseButton,
      //   callback,
      //   callbackName
      // }
      commit('addSnackbar', value);
    },
    closeSnackbar({dispatch, commit, state}){
      commit('closeCurrentSnackbar');
      commit('cancelSnackbarTimeout');
      if (state.snackbars.length){
        commit('setSnackbarTimout');
        state.snackbarTimout = setTimeout(() => {
          dispatch('closeSnackbar');
        }, 5000);
      }
    },
  }
});

export default store;
