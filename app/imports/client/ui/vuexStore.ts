import { createStore, type Store } from 'vuex';
import dialogStackStore, { type DialogStackStoreState } from '/imports/client/ui/dialogStack/dialogStackStore';
import Creatures from '/imports/api/creature/creatures/Creatures';
import type { CreatureProperty } from '/imports/api/creature/creatureProperties/CreatureProperties';
import type { InjectionKey } from 'vue';
const tabs = ['stats', 'actions', 'spells', 'inventory', 'features', 'journal', 'build', 'tree'] as const;
const tabsWithoutSpells = ['stats', 'actions', 'inventory', 'features', 'journal', 'build', 'tree'] as const;

type RootState = {
  drawer: boolean | undefined;
  rightDrawer: boolean | undefined;
  pageTitle: string | undefined;
  characterSheetTabs: Record<string, number>;
  showDetailsDialog: boolean;
  formExpansions: Partial<Record<CreatureProperty['type'], boolean>>;
}

type State = RootState & {
  dialogStack: DialogStackStoreState;
}

export const key: InjectionKey<Store<State>> = Symbol()

const store = createStore<RootState>({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    dialogStack: dialogStackStore,
  },
  state: () => ({
    drawer: undefined,
    rightDrawer: undefined,
    pageTitle: undefined,
    characterSheetTabs: {},
    showDetailsDialog: false,
    formExpansions: {},
  }),
  getters: {
    tabById: (state) => (id: string) => {
      return state.characterSheetTabs[id] ?? 0;
    },
    tabNameById: (state) => (id: string) => {
      const tabNumber = state.characterSheetTabs[id] ?? 0;
      const creature = Creatures.findOne(id);
      if (creature?.settings?.hideSpellsTab) {
        return tabsWithoutSpells[tabNumber];
      } else {
        return tabs[tabNumber]
      }
    },
    formExpansionByType: (state) => (type: CreatureProperty['type']) => {
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
    setDrawer(state, value: boolean) {
      state.drawer = value;
    },
    setRightDrawer(state, value: boolean) {
      state.rightDrawer = value;
    },
    setPageTitle(state, value: string) {
      state.pageTitle = value;
      document.title = value;
    },
    setTabForCharacterSheet(state, { tab, id }: { tab: typeof tabs[number] | number, id: string }) {
      // Convert tab names to tab numbers
      if (typeof tab === 'string') {
        const tabInput = tab;
        const creature = Creatures.findOne(id);
        if (creature?.settings?.hideSpellsTab && tab !== 'spells') {
          tab = tabsWithoutSpells.indexOf(tab);
        } else {
          tab = tabs.indexOf(tab);
        }
        if (!(tab > -1)) {
          console.warn(`could not find a tab called ${tabInput}`);
          tab = 0;
        }
      }
      state.characterSheetTabs[id] = tab;
    },
    setShowDetailsDialog(state, value: boolean) {
      state.showDetailsDialog = value;
    },
    setFormExpansion(state, { type, value }: { type: CreatureProperty['type'], value: boolean }) {
      state.formExpansions[type] = value;
    },
  },
});

export default store;
