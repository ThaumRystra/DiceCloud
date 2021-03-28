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
    characterSheetTabs: {},
    showBuildDialog: false,
  },
  getters: {
    // ...
    tabById: (state) => (id) => {
      if (id in state.characterSheetTabs){
        return state.characterSheetTabs[id];
      } else {
        return 0;
      }
    }
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
    setTabForCharacterSheet(state, {tab, id}){
      Vue.set(state.characterSheetTabs, id, tab);
    },
    setShowBuildDialog(state, value){
      state.showBuildDialog = value;
    },
  },
});

export default store;
