<template>
  <div class="character-sheet fill-height">
    <v-fade-transition mode="out-in">
      <div v-if="!creature">
        <v-layout
          column
          align-center
          justify-center
        >
          <h2 style="margin: 48px 28px 16px">
            Character not found
          </h2>
          <h3>
            Either this character does not exist, or you don't have permission
            to view it.
          </h3>
        </v-layout>
      </div>
      <div
        v-else
        key="character-tabs"
        class="card-background fill-height"
      >
        <v-tabs-items
          :key="tabsKey"
          :value="$store.getters.tabById(creatureId)"
          @change="e => $store.commit(
            'setTabForCharacterSheet',
            {id: creatureId, tab: e}
          )"
        >
          <v-tab-item
            v-for="tab in visibleTabs"
            :key="tab.id"
          >
            <component
              :is="tab.component"
              :creature-id="creatureId"
            />
          </v-tab-item>
        </v-tabs-items>
      </div>
    </v-fade-transition>
    <character-sheet-fab
      v-if="!embedded && $vuetify.breakpoint.xsOnly"
      direction="top"
      fixed
      bottom
      right
      class="character-sheet-bottom-fab"
      :edit-permission="editPermission"
    />
    <v-bottom-navigation
      v-if="!embedded && $vuetify.breakpoint.xsOnly && creature && creature.settings"
      app
      shift
      mandatory
      class="bottom-nav-btns"
      :value="$store.getters.tabById(creatureId)"
      @change="e => $store.commit(
        'setTabForCharacterSheet',
        {id: creatureId, tab: e}
      )"
    >
      <v-btn
        v-for="tab in visibleTabs"
        :key="tab.id"
      >
        <span>{{ tab.label }}</span>
        <v-icon>{{ tab.icon }}</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </div>
</template>

<script lang="js">
//TODO add a "no character found" screen if shown on a false address
// or on a character the user does not have permission to view
import Creatures from '/imports/api/creature/creatures/Creatures';
import StatsTab from '/imports/client/ui/creature/character/characterSheetTabs/StatsTab.vue';
import FeaturesTab from '/imports/client/ui/creature/character/characterSheetTabs/FeaturesTab.vue';
import InventoryTab from '/imports/client/ui/creature/character/characterSheetTabs/InventoryTab.vue';
import SpellsTab from '/imports/client/ui/creature/character/characterSheetTabs/SpellsTab.vue';
import JournalTab from '/imports/client/ui/creature/character/characterSheetTabs/JournalTab.vue';
import BuildTab from '/imports/client/ui/creature/character/characterSheetTabs/BuildTab.vue';
import TreeTab from '/imports/client/ui/creature/character/characterSheetTabs/TreeTab.vue';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import CharacterSheetFab from '/imports/client/ui/creature/character/CharacterSheetFab.vue';
import ActionsTab from '/imports/client/ui/creature/character/characterSheetTabs/ActionsTab.vue';
import CreatureLogs from '/imports/api/creature/log/CreatureLogs';

export default {
  components: {
    StatsTab,
    FeaturesTab,
    ActionsTab,
    SpellsTab,
    InventoryTab,
    JournalTab,
    BuildTab,
    TreeTab,
    CharacterSheetFab,
  },
  props: {
    creatureId: {
      type: String,
      required: true,
    },
    embedded: Boolean,
  },
  // @ts-expect-error reactive provide not typed
  reactiveProvide: {
    name: 'context',
    include: ['creatureId', 'editPermission'],
  },
  computed: {
    activeTab: {
      get() {
        return this.tabs;
      },
      set(newTab) {
        this.$emit('update:tabs', newTab);
      },
    },
    // Tab configuration is data-driven to allow game system libraries to inject
    // system-specific tabs in the future. See docs/proposed-refactors.md Mod 8.
    // To add a custom tab for a game system, extend this array conditionally
    // based on this.creature?.gameSystem (once Mod 1 is implemented).
    //
    // TODO: Allow game system libraries to add new tabs (requires Mod 1 gameSystem field first)
    // TODO: Hide D&D-specific sections within the Stats tab (separate follow-up)
    visibleTabs() {
      const allTabs = [
        {
          id: 'stats',
          label: 'Stats',
          icon: 'mdi-chart-box',
          component: 'StatsTab',
          show: true,
        },
        {
          id: 'actions',
          label: 'Actions',
          icon: 'mdi-lightning-bolt',
          component: 'ActionsTab',
          show: true,
        },
        {
          id: 'spells',
          label: 'Spells',
          icon: 'mdi-fire',
          component: 'SpellsTab',
          show: !this.creature?.settings?.hideSpellsTab,
        },
        {
          id: 'inventory',
          label: 'Inventory',
          icon: 'mdi-cube',
          component: 'InventoryTab',
          show: true,
        },
        {
          id: 'features',
          label: 'Features',
          icon: 'mdi-text',
          component: 'FeaturesTab',
          show: true,
        },
        {
          id: 'journal',
          label: 'Journal',
          icon: 'mdi-book-open-variant',
          component: 'JournalTab',
          show: true,
        },
        {
          id: 'build',
          label: 'Build',
          icon: 'mdi-wrench',
          component: 'BuildTab',
          show: true,
        },
        {
          id: 'tree',
          label: 'Tree',
          icon: 'mdi-file-tree',
          component: 'TreeTab',
          show: !!this.creature?.settings?.showTreeTab,
        },
      ];
      return allTabs.filter(tab => tab.show);
    },
    // Cache key for v-tabs-items: forces re-render when visibility changes
    tabsKey() {
      return '' +
        this.creature?.settings?.hideSpellsTab +
        this.creature?.settings?.showTreeTab;
    },
  },
  watch: {
    'creature.name'(value) {
      this.$store.commit('setPageTitle', value || 'Character Sheet');
    },
  },
  mounted() {
    this.$store.commit('setPageTitle', this.creature && this.creature.name || 'Character Sheet');
    this.nameObserver = Creatures.find({
      creatureId: this.creatureId,
    }, {
      fields: { name: 1 },
    }).observe({
      added: ({ name }) =>
        this.$store.commit('setPageTitle', name || 'Character Sheet'),
      changed: ({ name }) =>
        this.$store.commit('setPageTitle', name || 'Character Sheet'),
    });
    if (this.$route.name === 'characterSheet') {
      let that = this;
      this.logObserver = CreatureLogs.find({
        creatureId: this.creatureId,
      }).observe({
        added({ content }) {
          if (!that.$subReady.singleCharacter) return;
          if (that.$store.state.rightDrawer) return;
          if (that.$store.state.dialogStack.dialogs.length) return;
          snackbar({ content });
        },
      });
    }
  },
  beforeDestroy() {
    this.nameObserver?.stop();
    this.logObserver?.stop();
  },
  meteor: {
    creature() {
      return Creatures.findOne(this.creatureId, {
        fields: { variables: 0 }
      });
    },
    editPermission() {
      try {
        assertEditPermission(this.creature, Meteor.userId());
        return true;
      } catch (e) {
        return false;
      }
    },
  },
}
</script>

<style scoped>
.bottom-nav-btns > .v-btn{
  min-width: 0 !important;
  padding: 0 !important;
  flex: 1 1 auto !important;
  font-size: 0.6rem !important;
}
.character-sheet-bottom-fab {
  z-index: 5;
  bottom: 50px;
}
</style>

<style>
.character-sheet .v-window-item {
  min-height: calc(100vh - 96px);
  overflow: hidden;
}

.dialog-component .character-sheet .v-window-item {
  min-height: unset;
  overflow: unset;
}
</style>
