import Vue from "vue";
import Vuex from "vuex";
import dialogStackStore from "/imports/ui/dialogStack/dialogStackStore.js";

Vue.use(Vuex);
const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    dialogStack: dialogStackStore,
  },
  state: {
    drawer: undefined,
    darkMode: false,
  },
  mutations: {
    toggleDrawer (state) {
      state.drawer = !state.drawer;
    },
    setDrawer(state, value){
      state.drawer = value;
    },
    setDarkMode(state, value){
      state.darkMode = value;
    },
  },
});

export default store;
