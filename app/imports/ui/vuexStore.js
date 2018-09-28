import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);
const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    drawer: undefined,
  },
  mutations: {
    toggleDrawer (state) {
      state.drawer = !state.drawer;
    },
    setDrawer(state, value){
      state.drawer = value;
    },
  },
});

export default store;
