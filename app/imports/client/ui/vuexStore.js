import Vue from 'vue';
import Vuex from 'vuex';
import dialogStackStore from '/imports/client/ui/dialogStack/dialogStackStore';
import Creatures from '/imports/api/creature/creatures/Creatures';
const tabs = ['stats', 'actions', 'spells', 'inventory', 'features', 'journal', 'build', 'tree'];
const tabsWithoutSpells = ['stats', 'actions', 'inventory', 'features', 'journal', 'build', 'tree'];

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
    showDetailsDialog: false,
    formExpansions: {},
  },
  getters: {
    tabById: (state) => (id) => {
      return state.characterSheetTabs[id] ?? 0;
    },
    tabNameById: (state) => (id) => {
      const tabNumber = state.characterSheetTabs[id] ?? 0;
      const creature = Creatures.findOne(id);
      if (creature?.settings?.hideSpellsTab) {
        return tabsWithoutSpells[tabNumber];
      } else {
        return tabs[tabNumber]
      }
    },
    formExpansionByType: (state) => (type) => {
      return state.formExpansions[type] || [];
    },
  },
  mutations: {
    toggleDrawer(state) {
      state.drawer = !state.drawer;
    },
    toggleRightDrawer(state) {
      state.rightDrawer = !state.rightDrawer;
    },
    setDrawer(state, value) {
      state.drawer = value;
    },
    setRightDrawer(state, value) {
      state.rightDrawer = value;
    },
    setPageTitle(state, value) {
      state.pageTitle = value;
      document.title = value;
    },
    setTabForCharacterSheet(state, { tab, id }) {
      // Convert tab names to tab numbers
      if (typeof tab === 'string') {
        const tabInput = tab;
        const creature = Creatures.findOne(id);
        if (creature?.settings?.hideSpellsTab) {
          tab = tabsWithoutSpells.indexOf(tab);
        } else {
          tab = tabs.indexOf(tab);
        }
        if (!(tab > -1)) {
          console.warn(`could not find a tab called ${tabInput}`);
          tab = 0;
        }
      }
      Vue.set(state.characterSheetTabs, id, tab);
    },
    setShowDetailsDialog(state, value) {
      state.showDetailsDialog = value;
    },
    setFormExpansion(state, { type, value }) {
      state.formExpansions[type] = value;
    },
  },
});

export default store;
