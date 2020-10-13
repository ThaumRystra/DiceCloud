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
  },
});

export default store;
