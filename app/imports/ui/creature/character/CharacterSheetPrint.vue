<template>
  <div class="character-sheet-print fill-height">
    <div
      v-if="!$subReady.singleCharacter"
      key="character-loading"
      class="fill-height layout justify-center align-center"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      />
    </div>
    <div
      v-else-if="!creature"
    >
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
      class="fill-height"
    >
      <h2 class="text-h2 ma-2">
        {{ creature.name }}'s character sheet
      </h2>

      <h2 class="text-h3 ma-2">
        Stats
      </h2>
      <stats-tab :creature-id="creatureId" />
      <v-divider />
      <h2 class="text-h3 ma-2">
        Features
      </h2>
      <features-tab :creature-id="creatureId" />
      <v-divider />
      <h2 class="text-h3 ma-2">
        Inventory
      </h2>
      <inventory-tab :creature-id="creatureId" />
      <div v-show="!creature.settings.hideSpellsTab">
        <v-divider />
        <h2 class="text-h3 ma-2">
          Spells
        </h2>
        <spells-tab :creature-id="creatureId" />
      </div>
      <v-divider />
      <h2 class="text-h3 ma-2">
        Character
      </h2>
      <character-tab :creature-id="creatureId" />
    </div>
  </div>
</template>

<script lang="js">
//TODO add a "no character found" screen if shown on a false address
// or on a character the user does not have permission to view
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import StatsTab from '/imports/ui/creature/character/characterSheetTabs/StatsTab.vue';
import FeaturesTab from '/imports/ui/creature/character/characterSheetTabs/FeaturesTab.vue';
import InventoryTab from '/imports/ui/creature/character/characterSheetTabs/InventoryTab.vue';
import SpellsTab from '/imports/ui/creature/character/characterSheetTabs/SpellsTab.vue';
import CharacterTab from '/imports/ui/creature/character/characterSheetTabs/CharacterTab.vue';
import {assertEditPermission} from '../../../api/creature/creatures/creaturePermissions';

export default {
  components: {
    StatsTab,
    FeaturesTab,
    InventoryTab,
    SpellsTab,
    CharacterTab
  },
  props: {
    creatureId: {
      type: String,
      required: true,
    },
  },
  reactiveProvide: {
    name: 'context',
    include: ['creatureId', 'editPermission', 'printMode'],
  },
  computed: {},
  watch: {
    'creature.name'(value) {
      this.$store.commit('setPageTitle', value || 'Character Sheet');
    },
  },
  mounted() {
    this.$store.commit('setPageTitle', this.creature && this.creature.name || 'Character Sheet');
  },
  updated() {
    if (this.creature) {
      // ensure everything is rendered *after* the creature has been loaded
      this.$nextTick(function () {
        print();
      });
    }
  },
  meteor: {
    $subscribe: {
      'singleCharacter'() {
        return [this.creatureId];
      },
    },
    creature() {
      return Creatures.findOne(this.creatureId, {
        fields: {variables: 0}
      });
    },
    editPermission(){
      try {
        assertEditPermission(this.creature, Meteor.userId());
        return true;
      } catch (e) {
        return false;
      }
    },
    printMode () {
      return true;
    }
  },
}
</script>

<style>
.character-sheet .v-window-item {
  min-height: calc(100vh - 96px);
  overflow: hidden;
}
</style>
