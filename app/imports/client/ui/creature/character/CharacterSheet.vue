<script setup lang="ts">
import { ref, computed, watch, provide, reactive, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { autorun } from 'vue-meteor-tracker';
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
import { key } from '/imports/client/ui/vuexStore';

const props = withDefaults(defineProps<{
  creatureId: string;
  embedded?: boolean;
  tabs?: string;
}>(), {
  embedded: false,
  tabs: undefined,
});

const emit = defineEmits(['update:tabs']);
const store = useStore(key);
const route = useRoute();

const { result: creature } = autorun(() =>
  Creatures.findOne(props.creatureId, { fields: { variables: 0 } })
);

const { result: editPermission } = autorun(() => {
  try {
    assertEditPermission(creature.value, Meteor.userId());
    return true;
  } catch (e) {
    return false;
  }
});

provide('context', reactive({ creatureId: props.creatureId, editPermission }));

const activeTab = computed({
  get() { return props.tabs; },
  set(newTab) { emit('update:tabs', newTab); },
});

watch(() => creature.value?.name, (value) => {
  store.commit('setPageTitle', value || 'Character Sheet');
});

let nameObserver: any;
let logObserver: any;

onMounted(() => {
  store.commit('setPageTitle', creature.value?.name || 'Character Sheet');
  nameObserver = Creatures.find({
    _id: props.creatureId,
  }, {
    fields: { name: 1 },
  }).observe({
    added: ({ name }: any) => store.commit('setPageTitle', name || 'Character Sheet'),
    changed: ({ name }: any) => store.commit('setPageTitle', name || 'Character Sheet'),
  });
  if (route.name === 'characterSheet') {
    logObserver = CreatureLogs.find({
      creatureId: props.creatureId,
    }).observe({
      added({ content }: any) {
        if (!store.state.rightDrawer) return;
        if (store.state.dialogStack.dialogs.length) return;
        snackbar({ content });
      },
    });
  }
});

onBeforeUnmount(() => {
  nameObserver?.stop();
  logObserver?.stop();
});
</script>

<template>
  <div class="character-sheet fill-height">
    <v-fade-transition mode="out-in">
      <div v-if="!creature">
        <div class="d-flex flex-column align-center justify-center">
          <h2 style="margin: 48px 28px 16px">
            Character not found
          </h2>
          <h3>
            Either this character does not exist, or you don't have permission
            to view it.
          </h3>
        </div>
      </div>
      <div
        v-else
        key="character-tabs"
        class="card-background fill-height"
      >
        <v-window
          :key="'' +
            creature.settings.hideSpellsTab +
            creature.settings.showTreeTab
          "
          :model-value="$store.getters.tabById(creatureId)"
          @update:model-value="e => $store.commit(
            'setTabForCharacterSheet',
            { id: creatureId, tab: e }
          )"
        >
          <v-window-item>
            <stats-tab :creature-id="creatureId" />
          </v-window-item>
          <v-window-item>
            <actions-tab :creature-id="creatureId" />
          </v-window-item>
          <v-window-item v-if="!creature.settings.hideSpellsTab">
            <spells-tab :creature-id="creatureId" />
          </v-window-item>
          <v-window-item>
            <inventory-tab :creature-id="creatureId" />
          </v-window-item>
          <v-window-item>
            <features-tab :creature-id="creatureId" />
          </v-window-item>
          <v-window-item>
            <character-tab :creature-id="creatureId" />
          </v-window-item>
          <v-window-item>
            <build-tab :creature-id="creatureId" />
          </v-window-item>
          <v-window-item v-if="creature.settings.showTreeTab">
            <tree-tab :creature-id="creatureId" />
          </v-window-item>
        </v-window>
      </div>
    </v-fade-transition>
    <character-sheet-fab
      v-if="!embedded && $vuetify.display.xs"
      direction="top"
      fixed
      bottom
      right
      class="character-sheet-bottom-fab"
      :edit-permission="editPermission"
    />
    <v-bottom-navigation
      v-if="!embedded && $vuetify.display.xs && creature && creature.settings"
      app
      shift
      mandatory
      class="bottom-nav-btns"
      :model-value="$store.getters.tabById(creatureId)"
      @update:model-value="e => $store.commit(
        'setTabForCharacterSheet',
        { id: creatureId, tab: e }
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

<style scoped>
.bottom-nav-btns > .v-btn {
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
