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
          :key=" '' +
            creature.settings.hideSpellsTab +
            creature.settings.showTreeTab
          "
          :value="$store.getters.tabById(creatureId)"
          @change="e => $store.commit(
            'setTabForCharacterSheet',
            {id: creatureId, tab: e}
          )"
        >
          <v-tab-item>
            <stats-tab :creature-id="creatureId" />
          </v-tab-item>
          <v-tab-item>
            <actions-tab :creature-id="creatureId" />
          </v-tab-item>
          <v-tab-item v-if="!creature.settings.hideSpellsTab">
            <spells-tab :creature-id="creatureId" />
          </v-tab-item>
          <v-tab-item>
            <inventory-tab :creature-id="creatureId" />
          </v-tab-item>
          <v-tab-item>
            <features-tab :creature-id="creatureId" />
          </v-tab-item>
          <v-tab-item>
            <character-tab :creature-id="creatureId" />
          </v-tab-item>
          <v-tab-item>
            <build-tab :creature-id="creatureId" />
          </v-tab-item>
          <v-tab-item v-if="creature.settings.showTreeTab">
            <tree-tab :creature-id="creatureId" />
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
      <v-btn>
        <span>Stats</span>
        <v-icon>mdi-chart-box</v-icon>
      </v-btn>
      <v-btn>
        <span>Actions</span>
        <v-icon>mdi-lightning-bolt</v-icon>
      </v-btn>
      <v-btn v-if="!creature.settings.hideSpellsTab">
        <span>Spells</span>
        <v-icon>mdi-fire</v-icon>
      </v-btn>
      <v-btn>
        <span>Inventory</span>
        <v-icon>mdi-cube</v-icon>
      </v-btn>
      <v-btn>
        <span>Features</span>
        <v-icon>mdi-text</v-icon>
      </v-btn>
      <v-btn>
        <span>Journal</span>
        <v-icon>mdi-book-open-variant</v-icon>
      </v-btn>
      <v-btn>
        <span>Build</span>
        <v-icon>mdi-wrench</v-icon>
      </v-btn>
      <v-btn v-if="creature.settings.showTreeTab">
        <span>Tree</span>
        <v-icon>mdi-file-tree</v-icon>
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
import CharacterTab from '/imports/client/ui/creature/character/characterSheetTabs/JournalTab.vue';
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
    CharacterTab,
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
